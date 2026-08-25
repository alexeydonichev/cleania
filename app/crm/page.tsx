import { env } from "cloudflare:workers";
import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import CrmDashboard from "@/app/components/CrmDashboard";
import { rawDb } from "@/db/runtime";
import { requireCrmUser } from "@/lib/crm-auth";
import "./crm.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

type MetricRow = {
  orders_total: number;
  orders_new: number;
  pipeline: number;
  revenue: number;
  costs: number;
  profit: number;
  avg_check: number;
};

export default async function CrmPage() {
  const auth = await requireCrmUser("/crm");
  if (!auth.allowed || !auth.user)
    return (
      <main className="crm-access">
        <div>
          <span className="crm-logo">C</span>
          <h1>Доступ к CRM ограничен</h1>
          <p>
            Этот аккаунт не добавлен владельцем Cleania. Войдите под разрешённой
            учётной записью.
          </p>
          <Link href="/">Вернуться на сайт</Link>
        </div>
      </main>
    );
  const db = rawDb();
  const metrics = await db
    .prepare(
      `SELECT COUNT(*) AS orders_total, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS orders_new, COALESCE(SUM(CASE WHEN status NOT IN ('completed','cancelled') THEN estimate_total ELSE 0 END),0) AS pipeline, COALESCE(SUM(CASE WHEN status = 'completed' THEN COALESCE(final_total, estimate_total) ELSE 0 END),0) AS revenue, COALESCE(SUM(CASE WHEN status = 'completed' THEN cleaner_cost + supplies_cost + acquisition_cost + other_cost ELSE 0 END),0) AS costs, COALESCE(SUM(CASE WHEN status = 'completed' THEN COALESCE(final_total, estimate_total) - cleaner_cost - supplies_cost - acquisition_cost - other_cost ELSE 0 END),0) AS profit, COALESCE(AVG(CASE WHEN status = 'completed' THEN COALESCE(final_total, estimate_total) END),0) AS avg_check FROM orders`,
    )
    .first<MetricRow>();
  const orders = await db
    .prepare(
      `SELECT o.id, o.order_number, o.service_type, o.area, o.preferred_date, o.estimate_total, o.final_total, o.duration_hours, o.crew_size, o.status, o.payment_status, o.created_at, o.cleaner_cost, o.supplies_cost, o.acquisition_cost, o.other_cost, l.name, l.phone, l.source, COUNT(f.id) AS files_count, GROUP_CONCAT(f.id) AS file_ids FROM orders o JOIN leads l ON l.id = o.lead_id LEFT JOIN uploaded_files f ON f.order_id = o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 250`,
    )
    .all();
  const businessLeads = await db
    .prepare(
      `SELECT id, name, phone, source, status, notes, created_at FROM leads WHERE id NOT IN (SELECT lead_id FROM orders) ORDER BY created_at DESC LIMIT 100`,
    )
    .all();
  const daily = await db
    .prepare(
      `SELECT substr(created_at,1,10) AS day, COUNT(*) AS orders, SUM(estimate_total) AS pipeline, SUM(CASE WHEN status = 'completed' THEN COALESCE(final_total, estimate_total) ELSE 0 END) AS revenue FROM orders WHERE created_at >= datetime('now','-29 days') GROUP BY substr(created_at,1,10) ORDER BY day`,
    )
    .all();
  const crews = await db
    .prepare(
      `SELECT id, name, lead_name, phone, status, capacity_hours, rating, created_at FROM crews ORDER BY status, name`,
    )
    .all();
  const pricing = await db
    .prepare(
      `SELECT key, label, rate, minimum, active, updated_at FROM pricing_rules ORDER BY CASE key WHEN 'regular' THEN 1 WHEN 'deep' THEN 2 WHEN 'renovation' THEN 3 ELSE 4 END`,
    )
    .all();
  const sources = await db
    .prepare(
      `SELECT source, COUNT(*) AS leads, SUM(CASE WHEN id IN (SELECT lead_id FROM orders) THEN 1 ELSE 0 END) AS orders FROM leads GROUP BY source ORDER BY leads DESC`,
    )
    .all();
  const integrations = await db
    .prepare(
      `SELECT channel, status, COUNT(*) AS events FROM integration_events GROUP BY channel, status ORDER BY channel, status`,
    )
    .all();
  const runtime = env as typeof env & {
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string;
    MAX_BOT_TOKEN?: string;
    MAX_CHAT_ID?: string;
    EMAIL_WEBHOOK_URL?: string;
  };
  const integrationConfig = {
    telegram: Boolean(runtime.TELEGRAM_BOT_TOKEN && runtime.TELEGRAM_CHAT_ID),
    max: Boolean(runtime.MAX_BOT_TOKEN && runtime.MAX_CHAT_ID),
    email: Boolean(runtime.EMAIL_WEBHOOK_URL),
  };

  return (
    <CrmDashboard
      user={{
        name: auth.user.displayName,
        email: auth.user.email,
        role: auth.role || "manager",
        signOut: chatGPTSignOutPath("/"),
      }}
      metrics={{
        ordersTotal: Number(metrics?.orders_total || 0),
        ordersNew: Number(metrics?.orders_new || 0),
        pipeline: Number(metrics?.pipeline || 0),
        revenue: Number(metrics?.revenue || 0),
        costs: Number(metrics?.costs || 0),
        profit: Number(metrics?.profit || 0),
        avgCheck: Number(metrics?.avg_check || 0),
      }}
      orders={orders.results as never[]}
      businessLeads={businessLeads.results as never[]}
      daily={daily.results as never[]}
      crews={crews.results as never[]}
      pricing={pricing.results as never[]}
      sources={sources.results as never[]}
      integrations={integrations.results as never[]}
      integrationConfig={integrationConfig}
      today={new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Novosibirsk",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date())}
    />
  );
}
