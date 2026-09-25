import { NextResponse, type NextRequest } from "next/server";
import { isPreviewDeployment } from "./lib/deployment";
import { previewApiAllowed } from "./lib/preview-policy";

export function proxy(request: NextRequest) {
  if (!isPreviewDeployment) return NextResponse.next();
  if (previewApiAllowed(request.nextUrl.pathname, request.method)) return NextResponse.next();
  return NextResponse.json(
    { error: "Демонстрационная версия: приём заявок и CRM ещё не подключены. Данные не сохранены." },
    { status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}

export const config = { matcher: "/api/:path*" };
