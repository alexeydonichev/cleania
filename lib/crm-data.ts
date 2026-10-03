import { rawDb } from "@/db/runtime";
export type CrmOrder = { extras_json:string; duration_hours:number; crew_size:number; id: string; lead_id: string; order_number: string; name: string; phone: string; city: string; notes: string; service_type: string; area: number; status: string; payment_status: string; preferred_date: string | null; preferred_slot: string | null; address: string | null; assigned_crew_id: string | null; estimate_total: number; final_total: number | null; cleaner_cost: number; supplies_cost: number; acquisition_cost: number; other_cost: number; updated_at: string; created_at: string };
export type CrmLead = { id: string; name: string; phone: string; city: string; notes: string; source: string; status: string; updated_at: string; created_at: string };
export type CrmCrew = { id: string; name: string; phone: string; status: string; capacity_hours: number };
export type CrmPricing = { key: string; label: string; rate: number; minimum: number };
export async function loadWorkspace() {
  const db = rawDb();
  const [orders, leads, crews, pricing, activities, files] = await Promise.all([
    db.prepare("SELECT o.*, l.name, l.phone, l.city, l.notes FROM orders o JOIN leads l ON l.id=o.lead_id ORDER BY o.created_at DESC LIMIT 500").all<CrmOrder>(),
    db.prepare("SELECT id,name,phone,city,notes,source,status,updated_at,created_at FROM leads WHERE NOT EXISTS (SELECT 1 FROM orders WHERE lead_id=leads.id) ORDER BY created_at DESC LIMIT 500").all<CrmLead>(),
    db.prepare("SELECT id,name,phone,status,capacity_hours FROM crews ORDER BY name").all<CrmCrew>(),
    db.prepare("SELECT key,label,rate,minimum FROM pricing_rules ORDER BY key").all<CrmPricing>(),
    db.prepare("SELECT id,order_id,lead_id,body,created_at FROM activities ORDER BY created_at DESC LIMIT 1000").all<{id:string;order_id:string|null;lead_id:string|null;body:string;created_at:string}>(),
    db.prepare("SELECT id,order_id,file_name FROM uploaded_files ORDER BY created_at DESC LIMIT 1000").all<{id:string;order_id:string;file_name:string}>(),
  ]);
  // Never serialize upload tokens or other backend-only order columns into the browser.
  const safeOrders = orders.results.map(o => ({extras_json:o.extras_json,duration_hours:o.duration_hours,crew_size:o.crew_size,id:o.id,lead_id:o.lead_id,order_number:o.order_number,name:o.name,phone:o.phone,city:o.city,notes:o.notes,service_type:o.service_type,area:o.area,status:o.status,payment_status:o.payment_status,preferred_date:o.preferred_date,preferred_slot:o.preferred_slot,address:o.address,assigned_crew_id:o.assigned_crew_id,estimate_total:o.estimate_total,final_total:o.final_total,cleaner_cost:o.cleaner_cost,supplies_cost:o.supplies_cost,acquisition_cost:o.acquisition_cost,other_cost:o.other_cost,updated_at:o.updated_at,created_at:o.created_at}));
  return { orders: safeOrders, leads: leads.results, crews: crews.results, pricing: pricing.results, activities: activities.results, files: files.results };
}
export type WorkspaceData = Awaited<ReturnType<typeof loadWorkspace>>;
