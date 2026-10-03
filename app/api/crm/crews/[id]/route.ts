import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess,apiFailure } from "@/lib/crm-api";
import { record,textField,numberField,enumField } from "@/lib/crm-validation";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{const a=await crmAccess(request);if(a.error)return a.error;const {id}=await params;let b,name,phone,status,hours;
    try{b=record(await request.json());name=textField(b.name,100,true);phone=textField(b.phone,40);status=enumField(b.status,["active","inactive"]);hours=numberField(b.capacityHours,1,24);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Проверьте поля"},{status:400});}
    const db=rawDb();if(status==="inactive"&&await db.prepare("SELECT id FROM orders WHERE assigned_crew_id=? AND status NOT IN ('completed','cancelled') LIMIT 1").bind(id).first())return NextResponse.json({error:"Сначала передайте активные заказы другому исполнителю"},{status:409});
    const r=await db.prepare("UPDATE crews SET name=?,phone=?,status=?,capacity_hours=? WHERE id=?").bind(name,phone,status,hours,id).run();
    return NextResponse.json(r.meta.changes?{ok:true}:{error:"Исполнитель не найден"},{status:r.meta.changes?200:404});
  }catch(e){return apiFailure(e);}
}
