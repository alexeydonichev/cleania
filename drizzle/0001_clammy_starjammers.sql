CREATE TABLE `crm_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pricing_rules` (
	`key` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`rate` integer NOT NULL,
	`minimum` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `cleaner_cost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `supplies_cost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `acquisition_cost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `other_cost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `upload_token` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_upload_token_unique` ON `orders` (`upload_token`);