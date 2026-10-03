import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess, apiFailure } from "@/lib/crm-api";
import { record,textField,enumField } from "@/lib/crm-validation";
import { validPhone } from "@/lib/quote";
export async function POST(request:Request){
  try{
    const a=await crmAccess(request);if(a.error)return a.error;
    let b,name,phone,city,notes,source,id;
    try{b=record(await request.json());name=textField(b.name,100,true);phone=textField(b.phone,40,true);city=textField(b.city,100,true);notes=textField(b.notes,4000);source=enumField(b.source,["direct","referral","maps","ads"]);id=textField(b.id,50,true);if(!/^[0-9a-f-]{36}$/.test(id)||!validPhone(phone)||b.consent!==true)throw new Error("Проверьте телефон и подтвердите согласие клиента");}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Проверьте поля"},{status:400});}
    const now=new Date().toISOString(); const db=rawDb();
    await db.batch([
      db.prepare("INSERT OR IGNORE INTO leads(id,name,phone,city,source,status,notes,consent_at,created_at,updated_at) VALUES(?,?,?,?,?,'new',?,?,?,?)").bind(id,name,phone,city,source,notes,now,now,now),
      db.prepare("INSERT INTO activities(id,lead_id,actor_id,type,body,created_at) SELECT ?,?,?,'lead_created','Обращение добавлено менеджером; согласие подтверждено',? WHERE changes()>0").bind(crypto.randomUUID(),id,a.auth!.user!.userId,now),
    ]); return NextResponse.json({ok:true},{status:201});
  }catch(e){return apiFailure(e);}
}
