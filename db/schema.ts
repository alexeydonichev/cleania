import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const crmUsers = sqliteTable("crm_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role").notNull().default("manager"),
  createdAt: text("created_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  messenger: text("messenger"),
  source: text("source").notNull().default("website"),
  city: text("city").notNull().default("Новосибирск"),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  consentAt: text("consent_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  leadId: text("lead_id").notNull(),
  serviceType: text("service_type").notNull(),
  area: integer("area").notNull(),
  bathrooms: integer("bathrooms").notNull().default(1),
  condition: text("condition").notNull().default("normal"),
  frequency: text("frequency").notNull().default("once"),
  extrasJson: text("extras_json").notNull().default("[]"),
  preferredDate: text("preferred_date"),
  preferredSlot: text("preferred_slot"),
  address: text("address"),
  estimateTotal: integer("estimate_total").notNull(),
  finalTotal: integer("final_total"),
  durationHours: real("duration_hours").notNull(),
  crewSize: integer("crew_size").notNull(),
  status: text("status").notNull().default("new"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  assignedCrewId: text("assigned_crew_id"),
  cleanerCost: integer("cleaner_cost").notNull().default(0),
  suppliesCost: integer("supplies_cost").notNull().default(0),
  acquisitionCost: integer("acquisition_cost").notNull().default(0),
  otherCost: integer("other_cost").notNull().default(0),
  uploadToken: text("upload_token").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  orderId: text("order_id"),
  leadId: text("lead_id"),
  actorId: text("actor_id"),
  type: text("type").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const crews = sqliteTable("crews", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  leadName: text("lead_name"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  capacityHours: real("capacity_hours").notNull().default(8),
  rating: real("rating").notNull().default(5),
  createdAt: text("created_at").notNull(),
});

export const integrationEvents = sqliteTable("integration_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id"),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const uploadedFiles = sqliteTable("uploaded_files", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  objectKey: text("object_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull(),
});

export const pricingRules = sqliteTable("pricing_rules", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  rate: integer("rate").notNull(),
  minimum: integer("minimum").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull(),
});

export const crmSettings = sqliteTable("crm_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const requestLimits = sqliteTable("request_limits", {
  bucket: text("bucket").primaryKey(),
  hits: integer("hits").notNull().default(1),
  expiresAt: integer("expires_at").notNull(),
});
