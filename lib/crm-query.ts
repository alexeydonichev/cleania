export type WorkspaceQuery = { view?: string; query?: string; filter?: string; page?: number };
export const crmPageSize = 40;
export function workspaceQuery(input: WorkspaceQuery) {
  return {
    view: ["orders","leads","schedule","clients","finance","team","pricing","content"].includes(input.view || "") ? input.view! : "orders",
    query: String(input.query || "").trim().slice(0,120),
    filter: ["active","all","new","confirmed","scheduled","in_progress","completed","cancelled"].includes(input.filter || "") ? input.filter! : "all",
    page: Number.isSafeInteger(input.page) && input.page! > 0 ? Math.min(input.page!,1000000) : 1,
  };
}
function russianLower(column: string) {
  let value = `lower(COALESCE(${column},''))`;
  for (const c of "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ") value = `replace(${value},'${c}','${c.toLowerCase()}')`;
  return `replace(${value},'ё','е')`;
}
export function workspaceWhere(input: WorkspaceQuery, orders: boolean) {
  const q = workspaceQuery(input), values: (string|number)[] = [], parts: string[] = [];
  if (!orders) parts.push("NOT EXISTS (SELECT 1 FROM orders WHERE lead_id=l.id)");
  if (orders) {
    if (q.view === "schedule") parts.push("o.status NOT IN ('completed','cancelled')");
    else if(q.view === "finance") parts.push("o.status='completed' AND o.payment_status!='paid'");
    else if(q.view === "orders" && q.filter !== "all") {
      if(q.filter === "active") parts.push("o.status NOT IN ('completed','cancelled')");
      else {parts.push("o.status=?");values.push(q.filter);}
    }
  }
  if (q.query && ["orders","leads","clients"].includes(q.view)) {
    const phoneQuery=/^[+\d\s().-]+$/.test(q.query) ? q.query.replace(/\D/g,"") : "";
    if (phoneQuery.length >= 3) {
      let phone="COALESCE(l.phone,'')";
      for (const c of ["+"," ","(",")","-","."])phone=`replace(${phone},'${c}','')`;
      parts.push(`instr(CASE WHEN length(${phone})=11 AND substr(${phone},1,1)='8' THEN '7'||substr(${phone},2) ELSE ${phone} END,?)>0`);
      values.push(phoneQuery.length===11&&phoneQuery.startsWith("8")?`7${phoneQuery.slice(1)}`:phoneQuery);
    } else {
      const columns=orders?["l.name","l.phone","o.order_number","o.address"]:["l.name","l.phone"];
      parts.push(`(${columns.map(c=>`instr(${russianLower(c)},?)>0`).join(" OR ")})`);
      values.push(...columns.map(()=>q.query.toLocaleLowerCase("ru-RU").replace(/ё/g,"е")));
    }
  }
  return {sql: parts.length?parts.join(" AND "):"1=1",values};
}
