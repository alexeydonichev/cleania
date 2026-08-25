import { env } from "cloudflare:workers";

let schemaPromise: Promise<void> | null = null;

const statements = [
  `CREATE TABLE IF NOT EXISTS crm_users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, full_name TEXT, role TEXT NOT NULL DEFAULT 'manager', created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, messenger TEXT, source TEXT NOT NULL DEFAULT 'website', city TEXT NOT NULL DEFAULT 'Новосибирск', status TEXT NOT NULL DEFAULT 'new', notes TEXT, consent_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, order_number TEXT NOT NULL UNIQUE, lead_id TEXT NOT NULL, service_type TEXT NOT NULL, area INTEGER NOT NULL, bathrooms INTEGER NOT NULL DEFAULT 1, condition TEXT NOT NULL DEFAULT 'normal', frequency TEXT NOT NULL DEFAULT 'once', extras_json TEXT NOT NULL DEFAULT '[]', preferred_date TEXT, preferred_slot TEXT, address TEXT, estimate_total INTEGER NOT NULL, final_total INTEGER, duration_hours REAL NOT NULL, crew_size INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'new', payment_status TEXT NOT NULL DEFAULT 'unpaid', assigned_crew_id TEXT, cleaner_cost INTEGER NOT NULL DEFAULT 0, supplies_cost INTEGER NOT NULL DEFAULT 0, acquisition_cost INTEGER NOT NULL DEFAULT 0, other_cost INTEGER NOT NULL DEFAULT 0, upload_token TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY, order_id TEXT, lead_id TEXT, actor_id TEXT, type TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS crews (id TEXT PRIMARY KEY, name TEXT NOT NULL, lead_name TEXT, phone TEXT, status TEXT NOT NULL DEFAULT 'active', capacity_hours REAL NOT NULL DEFAULT 8, rating REAL NOT NULL DEFAULT 5, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS integration_events (id TEXT PRIMARY KEY, order_id TEXT, channel TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS uploaded_files (id TEXT PRIMARY KEY, order_id TEXT NOT NULL, object_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS pricing_rules (key TEXT PRIMARY KEY, label TEXT NOT NULL, rate INTEGER NOT NULL, minimum INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS crm_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS request_limits (bucket TEXT PRIMARY KEY, hits INTEGER NOT NULL DEFAULT 1, expires_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_preferred_date ON orders(preferred_date)`,
  `CREATE INDEX IF NOT EXISTS idx_activities_order_created ON activities(order_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_integration_events_status ON integration_events(status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_uploaded_files_order ON uploaded_files(order_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_request_limits_expires ON request_limits(expires_at)`,
  `INSERT OR IGNORE INTO pricing_rules (key, label, rate, minimum, active, updated_at) VALUES ('regular', 'Поддерживающая', 95, 2490, 1, '2026-08-25T00:00:00.000Z')`,
  `INSERT OR IGNORE INTO pricing_rules (key, label, rate, minimum, active, updated_at) VALUES ('deep', 'Генеральная', 160, 4490, 1, '2026-08-25T00:00:00.000Z')`,
  `INSERT OR IGNORE INTO pricing_rules (key, label, rate, minimum, active, updated_at) VALUES ('renovation', 'После ремонта', 230, 6990, 1, '2026-08-25T00:00:00.000Z')`,
  `INSERT OR IGNORE INTO pricing_rules (key, label, rate, minimum, active, updated_at) VALUES ('office', 'Офис', 110, 5990, 1, '2026-08-25T00:00:00.000Z')`,
];

export async function ensureDatabase() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = env.DB;
      if (!db) throw new Error("D1 binding DB is unavailable");
      await db.batch(statements.map((statement) => db.prepare(statement)));
      await db.prepare("PRAGMA optimize").run();
    })();
  }
  return schemaPromise;
}

export function rawDb() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}
