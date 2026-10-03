CREATE TABLE `cms_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`draft` text NOT NULL,
	`published` text,
	`previous` text,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
