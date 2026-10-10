import { rawDb } from "@/db/runtime";
import { crmPageSize, workspaceQuery, workspaceWhere, type WorkspaceQuery } from "./crm-query";
import { todayInNovosibirsk } from "./quote";
export type CrmOrder = { extras_json:string; duration_hours:number; crew_size:number; id: string; lead_id: string; order_number: string; name: string; phone: string; city: string; notes: string; service_type: string; area: number; status: string; payment_status: string; preferred_date: string | null; preferred_slot: string | null; address: string | null; assigned_crew_id: string | null; estimate_total: number; final_total: number | null; cleaner_cost: number; supplies_cost: number; acquisition_cost: number; other_cost: number; updated_at: string; created_at: string };
export type CrmLead = { id: string; name: string; phone: string; city: string; notes: string; source: string; status: string; updated_at: string; created_at: string };
export type CrmCrew = { id: string; name: string; phone: string; status: string; capacity_hours: number };
export type CrmPricing = { key: string; label: string; rate: number; minimum: number; updated_at: string };

export async function loadWorkspace(input: WorkspaceQuery = {}) {
  const db=rawDb(), q=workspaceQuery(input);
  const ow=workspaceWhere(q,true), lw=workspaceWhere(q,false);
  const [oc,lc]=await Promise.all([
    db.prepare("SELECT COUNT(*) n FROM orders o JOIN leads l ON l.id=o.lead_id WHERE "+ow.sql).bind(...ow.values).first<{n:number}>(),
    db.prepare("SELECT COUNT(*) n FROM leads l WHERE "+lw.sql).bind(...lw.values).first<{n:number}>(),
  ]);
  const total=q.view==="leads"?(lc?.n||0):q.view==="clients"?Math.max(oc?.n||0,lc?.n||0):(oc?.n||0);
  const pages=Math.max(1,Math.ceil(total/crmPageSize)), page=Math.min(q.page,pages), offset=(page-1)*crmPageSize;
  const [orders,leads,crews,pricing,metrics]=await Promise.all([
    db.prepare("SELECT o.*,l.name,l.phone,l.city,l.notes FROM orders o JOIN leads l ON l.id=o.lead_id WHERE "+ow.sql+" ORDER BY "+(q.view==="schedule"?"COALESCE(o.preferred_date,'9999'),o.id":"o.created_at DESC,o.id DESC")+" LIMIT ? OFFSET ?").bind(...ow.values,crmPageSize,offset).all<CrmOrder>(),
    db.prepare("SELECT l.id,l.name,l.phone,l.city,l.notes,l.source,l.status,l.updated_at,l.created_at FROM leads l WHERE "+lw.sql+" ORDER BY l.created_at DESC,l.id DESC LIMIT ? OFFSET ?").bind(...lw.values,crmPageSize,offset).all<CrmLead>(),
    db.prepare("SELECT c.id,c.name,c.phone,c.status,c.capacity_hours,(SELECT COUNT(*) FROM orders o WHERE o.assigned_crew_id=c.id AND o.status NOT IN ('completed','cancelled')) active_orders FROM crews c ORDER BY c.name").all<CrmCrew & {active_orders:number}>(),
    db.prepare("SELECT key,label,rate,minimum,updated_at FROM pricing_rules ORDER BY key").all<CrmPricing>(),
    db.prepare(`SELECT COUNT(*) total,
      COALESCE(SUM(status='new'),0) new_orders,
      COALESCE(SUM(preferred_date=? AND status!='cancelled'),0) today_orders,
      COALESCE(SUM(status='completed'),0) completed,
      COALESCE(SUM(status='completed' AND payment_status!='paid'),0) unpaid,
      COALESCE(SUM(CASE WHEN status='completed' THEN COALESCE(final_total,estimate_total) ELSE 0 END),0) revenue,
      COALESCE(SUM(CASE WHEN status='completed' THEN cleaner_cost+supplies_cost+acquisition_cost+other_cost ELSE 0 END),0) costs,
      (SELECT COUNT(*) FROM leads l WHERE status!='closed' AND NOT EXISTS(SELECT 1 FROM orders WHERE lead_id=l.id)) active_leads
      FROM orders`).bind(todayInNovosibirsk()).first<{total:number;new_orders:number;today_orders:number;completed:number;unpaid:number;revenue:number;costs:number;active_leads:number}>(),
  ]);
  const orderIds=orders.results.map(o=>o.id),leadIds=leads.results.map(l=>l.id);
  const placeholders=(ids:string[])=>ids.map(()=>"?").join(",")||"NULL";
  const related="order_id IN ("+placeholders(orderIds)+") OR lead_id IN ("+placeholders(leadIds)+")";
  const [activities,files,deliveries]=await Promise.all([
    db.prepare("SELECT id,order_id,lead_id,body,created_at FROM activities WHERE "+related+" ORDER BY created_at DESC,id DESC").bind(...orderIds,...leadIds).all<{id:string;order_id:string|null;lead_id:string|null;body:string;created_at:string}>(),
    db.prepare("SELECT id,order_id,file_name FROM uploaded_files WHERE order_id IN ("+placeholders(orderIds)+") ORDER BY created_at DESC,id DESC").bind(...orderIds).all<{id:string;order_id:string;file_name:string}>(),
    db.prepare("SELECT id,order_id,lead_id,channel,status,attempts,updated_at FROM integration_events WHERE "+related+" ORDER BY updated_at DESC,id DESC").bind(...orderIds,...leadIds).all<{id:string;order_id:string|null;lead_id:string|null;channel:string;status:string;attempts:number;updated_at:string}>(),
  ]);
  // Never serialize upload tokens or other backend-only order columns into the browser.
  const safeOrders = orders.results.map(o => ({extras_json:o.extras_json,duration_hours:o.duration_hours,crew_size:o.crew_size,id:o.id,lead_id:o.lead_id,order_number:o.order_number,name:o.name,phone:o.phone,city:o.city,notes:o.notes,service_type:o.service_type,area:o.area,status:o.status,payment_status:o.payment_status,preferred_date:o.preferred_date,preferred_slot:o.preferred_slot,address:o.address,assigned_crew_id:o.assigned_crew_id,estimate_total:o.estimate_total,final_total:o.final_total,cleaner_cost:o.cleaner_cost,supplies_cost:o.supplies_cost,acquisition_cost:o.acquisition_cost,other_cost:o.other_cost,updated_at:o.updated_at,created_at:o.created_at}));

  return {orders:safeOrders,leads:leads.results,crews:crews.results,pricing:pricing.results,activities:activities.results,files:files.results,deliveries:deliveries.results,
    pagination:{page,pages,orderTotal:oc?.n||0,leadTotal:lc?.n||0,pageSize:crmPageSize},metrics:metrics!};
}
export type WorkspaceData = Awaited<ReturnType<typeof loadWorkspace>>;
