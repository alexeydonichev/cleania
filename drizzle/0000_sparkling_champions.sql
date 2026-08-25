CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`lead_id` text,
	`actor_id` text,
	`type` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `crews` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lead_name` text,
	`phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`capacity_hours` real DEFAULT 8 NOT NULL,
	`rating` real DEFAULT 5 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `crm_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text,
	`role` text DEFAULT 'manager' NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `crm_users_email_unique` ON `crm_users` (`email`);--> statement-breakpoint
CREATE TABLE `integration_events` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`channel` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`messenger` text,
	`source` text DEFAULT 'website' NOT NULL,
	`city` text DEFAULT 'Новосибирск' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`lead_id` text NOT NULL,
	`service_type` text NOT NULL,
	`area` integer NOT NULL,
	`bathrooms` integer DEFAULT 1 NOT NULL,
	`condition` text DEFAULT 'normal' NOT NULL,
	`frequency` text DEFAULT 'once' NOT NULL,
	`extras_json` text DEFAULT '[]' NOT NULL,
	`preferred_date` text,
	`preferred_slot` text,
	`address` text,
	`estimate_total` integer NOT NULL,
	`final_total` integer,
	`duration_hours` real NOT NULL,
	`crew_size` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`assigned_crew_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `uploaded_files` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`object_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploaded_files_object_key_unique` ON `uploaded_files` (`object_key`);