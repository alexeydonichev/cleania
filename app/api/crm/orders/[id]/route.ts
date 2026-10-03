import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess, apiFailure } from "@/lib/crm-api";
import { record, textField, numberField, dateField, enumField, orderStatuses } from "@/lib/crm-validation";
export async function PATCH(request: Request, context: {params:Promise<{id:string}>}) {
  try {
    const access=await crmAccess(request); if(access.error)return access.error;
    const {id}=await context.params; const db=rawDb();
    const current=await db.prepare("SELECT updated_at FROM orders WHERE id=?").bind(id).first<{updated_at:string}>();
    if(!current)return NextResponse.json({error:"Заказ не найден"},{status:404});
    let b,status,payment,date,slot,address,crew,amount,costs,version,note;
    try {
      b=record(await request.json()); version=textField(b.version,50,true);
      status=enumField(b.status,Object.keys(orderStatuses)); payment=enumField(b.paymentStatus,["unpaid","partial","paid"]);
      date=dateField(b.date); slot=textField(b.slot,50); address=textField(b.address,500); crew=textField(b.crew,100)||null;
      amount=b.finalTotal === "" || b.finalTotal === null ? null : Math.round(numberField(b.finalTotal));
      costs=[b.cleanerCost,b.suppliesCost,b.acquisitionCost,b.otherCost].map(v=>Math.round(numberField(v)));
      note=textField(b.note,4000);
      if(["scheduled","in_progress"].includes(status)&&(!date||!crew))throw new Error("Для назначения укажите дату и исполнителя");
    }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Проверьте данные"},{status:400});}
    if(current.updated_at!==version)return NextResponse.json({error:"Заказ уже изменён. Обновите данные перед сохранением."},{status:409});
    if(crew&&!await db.prepare("SELECT id FROM crews WHERE id=? AND status='active'").bind(crew).first())return NextResponse.json({error:"Исполнитель недоступен"},{status:400});
    const now=new Date().toISOString();
    const result=await db.batch([
      db.prepare("UPDATE orders SET status=?,payment_status=?,preferred_date=?,preferred_slot=?,address=?,assigned_crew_id=?,final_total=?,cleaner_cost=?,supplies_cost=?,acquisition_cost=?,other_cost=?,updated_at=? WHERE id=? AND updated_at=?").bind(status,payment,date,slot,address,crew,amount,...costs,now,id,version),
      db.prepare("INSERT INTO activities(id,order_id,actor_id,type,body,created_at) SELECT ?,?,?, 'order_updated',?,? WHERE changes()>0").bind(crypto.randomUUID(),id,access.auth!.user!.userId,`Заказ обновлён: ${orderStatuses[status as keyof typeof orderStatuses]}.${note?` Комментарий: ${note}`:""}`,now),
    ]);
    if(!result[0].meta.changes)return NextResponse.json({error:"Заказ изменён другим сотрудником"},{status:409});
    return NextResponse.json({ok:true});
  }catch(e){return apiFailure(e);}
}
