import { NextResponse } from "next/server";
import { ensureDatabase, rawDb } from "@/db/runtime";

export async function GET() {
  try {
    await ensureDatabase();
    const rows = await rawDb()
      .prepare(
        "SELECT key, label, rate, minimum FROM pricing_rules WHERE active = 1 ORDER BY key",
      )
      .all();
    return NextResponse.json(
      { rules: rows.results },
      {
        headers: {
          "cache-control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("pricing_read_failed", error);
    return NextResponse.json(
      { error: "Не удалось загрузить тарифы" },
      { status: 500 },
    );
  }
}
