import { NextResponse } from "next/server";
import { rawDb } from "@/db/runtime";
import { crmAccess, apiFailure } from "@/lib/crm-api";
import { cmsWorkspace } from "@/lib/cms";
import { validateContent } from "@/lib/cms-validation";
import { enumField, numberField, record, textField } from "@/lib/crm-validation";
export async function GET(request: Request) {
  try { const a = await crmAccess(request, true); if (a.error) return a.error;
    return NextResponse.json({ documents: await cmsWorkspace() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return apiFailure(e); }
}
export async function POST(request: Request) {
  try {
    const a = await crmAccess(request, true); if (a.error) return a.error;
    let b, kind, slug, version, action, content;
    try {
      b = record(await request.json()); kind = enumField(b.kind, ["article", "service"] as const); slug = textField(b.slug,120,true);
      version = numberField(b.version,0,1000000); action = enumField(b.action,["save","publish","hide","restore"] as const);
      content = validateContent(kind,slug,b.content);
      if (action === "hide" && kind !== "article") throw new Error("Услуги нельзя скрывать");
    } catch (e) { return NextResponse.json({error: e instanceof Error ? e.message : "Проверьте данные"},{status:400}); }
    const id = `${kind}:${slug}`;
    const current = (await cmsWorkspace()).find(d => d.id===id);
    if ((current?.version || 0) !== version) return NextResponse.json({error:"Материал изменён в другой вкладке. Обновите список и повторите правки."},{status:409});
    if (action === "restore" && !current?.previous) return NextResponse.json({error:"Предыдущей публикации нет"},{status:400});
    const draft = JSON.stringify(content);
    const published = action === "publish" ? draft : action === "hide" ? "null" : action === "restore" ? current!.previous : current?.published || null;
    const previous = action === "save" ? current?.previous || null : current?.published || null;
    const now = new Date().toISOString(); const db = rawDb();
    const result = await db.prepare("INSERT INTO cms_documents (id,kind,draft,published,previous,version,updated_at,updated_by) VALUES (?,?,?,?,?,1,?,?) ON CONFLICT(id) DO UPDATE SET draft=excluded.draft,published=excluded.published,previous=excluded.previous,version=cms_documents.version+1,updated_at=excluded.updated_at,updated_by=excluded.updated_by WHERE cms_documents.version=?")
      .bind(id,kind,action === "restore" && published !== "null" ? published! : draft,published,previous,now,a.auth!.user!.userId,version).run();
    if (!result.meta.changes) return NextResponse.json({error:"Версия устарела. Обновите список."},{status:409});
    return NextResponse.json({ok:true,documents:await cmsWorkspace()});
  } catch(e) {return apiFailure(e);}
}
