import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess,apiFailure } from "@/lib/crm-api";
import { record,textField,enumField,leadStatuses,numberField,dateField } from "@/lib/crm-validation";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const a=await crmAccess(request);if(a.error)return a.error;const {id}=await params;const db=rawDb();
    let b,status,notes,version;
    try{b=record(await request.json());status=enumField(b.status,Object.keys(leadStatuses));notes=textField(b.notes,4000);version=textField(b.version,50,true);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Проверьте поля"},{status:400});}
    const now=new Date().toISOString();const result=await db.batch([
      db.prepare("UPDATE leads SET status=?,notes=?,updated_at=? WHERE id=? AND updated_at=?").bind(status,notes,now,id,version),
      db.prepare("INSERT INTO activities(id,lead_id,actor_id,type,body,created_at) SELECT ?,?,?,'lead_updated',?,? WHERE changes()>0").bind(crypto.randomUUID(),id,a.auth!.user!.userId,`Обращение: ${leadStatuses[status as keyof typeof leadStatuses]}`,now),
    ]);if(!result[0].meta.changes)return NextResponse.json({error:"Обращение изменилось. Обновите список."},{status:409});return NextResponse.json({ok:true});
  }catch(e){return apiFailure(e);}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const a=await crmAccess(request);if(a.error)return a.error;const {id}=await params;const db=rawDb();
    const lead=await db.prepare("SELECT id FROM leads WHERE id=?").bind(id).first();if(!lead)return NextResponse.json({error:"Обращение не найдено"},{status:404});
    if(await db.prepare("SELECT id FROM orders WHERE lead_id=?").bind(id).first())return NextResponse.json({ok:true});
    let b,service,area,total,date,address;
    try{b=record(await request.json());service=enumField(b.service,["regular","deep","renovation","office"]);area=numberField(b.area,1,4000);total=numberField(b.total);date=dateField(b.date);address=textField(b.address,500);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Проверьте поля"},{status:400});}
    const now=new Date().toISOString(); const orderId=`crm-${id}`;
    await db.batch([
      db.prepare("INSERT OR IGNORE INTO orders(id,order_number,lead_id,service_type,area,estimate_total,duration_hours,crew_size,status,preferred_date,address,upload_token,created_at,updated_at) VALUES(?,?,?,?,?,?,2,1,'confirmed',?,?,?,?,?)").bind(orderId,`БП-${id.slice(0,8).toUpperCase()}`,id,service,area,total,date,address,crypto.randomUUID(),now,now),
      db.prepare("INSERT INTO activities(id,order_id,lead_id,actor_id,type,body,created_at) SELECT ?,?,?,?,'converted','Обращение переведено в заказ',? WHERE changes()>0").bind(crypto.randomUUID(),orderId,id,a.auth!.user!.userId,now),
      db.prepare("UPDATE leads SET status='qualified',updated_at=? WHERE id=?").bind(now,id),
    ]);return NextResponse.json({ok:true},{status:201});
  }catch(e){return apiFailure(e);}
}
