import { NextResponse, type NextRequest } from "next/server";
import { isPreviewDeployment } from "./lib/deployment";
import { previewApiAllowed } from "./lib/preview-policy";

export function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === "www.xn--90aipcrfhf.xn--p1ai") {
    const url = request.nextUrl.clone();
    url.hostname = "xn--90aipcrfhf.xn--p1ai";
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  const apiRequest = request.nextUrl.pathname === "/api" || request.nextUrl.pathname.startsWith("/api/");
  if (!isPreviewDeployment || !apiRequest) return NextResponse.next();
  if (previewApiAllowed(request.nextUrl.pathname, request.method)) return NextResponse.next();
  return NextResponse.json(
    { error: "Демонстрационная версия: приём заявок и CRM ещё не подключены. Данные не сохранены." },
    { status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}

export const config = { matcher: "/:path*" };
