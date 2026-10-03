import { NextResponse } from "next/server";
import { crmAccess, apiFailure } from "@/lib/crm-api";
import { loadWorkspace } from "@/lib/crm-data";
export async function GET(request: Request) {
  try { const access = await crmAccess(request); if (access.error) return access.error;
    return NextResponse.json(await loadWorkspace(), { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return apiFailure(e); }
}
