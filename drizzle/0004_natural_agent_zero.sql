CREATE TABLE `public_submissions` (
	`request_key` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`response_json` text NOT NULL,
	`created_at` text NOT NULL
);
