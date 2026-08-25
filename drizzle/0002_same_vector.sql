CREATE TABLE `request_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`hits` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
