import { NextResponse } from "next/server";
import { crmAccess, apiFailure } from "@/lib/crm-api";
import { loadWorkspace } from "@/lib/crm-data";
export async function GET(request: Request) {
  try { const access = await crmAccess(request); if (access.error) return access.error;
    const params=new URL(request.url).searchParams;
    return NextResponse.json(await loadWorkspace({view:params.get("view")||undefined,query:params.get("query")||undefined,filter:params.get("filter")||undefined,page:Number(params.get("page")||1)}), { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return apiFailure(e); }
}
