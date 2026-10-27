CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`station` text NOT NULL,
	`design` text NOT NULL,
	`machine` text NOT NULL,
	`color` text NOT NULL,
	`status` text NOT NULL,
	`observed_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`notes` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text,
	`client_hash` text
);
--> statement-breakpoint
CREATE TABLE `sync_state` (
	`id` text PRIMARY KEY NOT NULL,
	`attempted_at` integer NOT NULL,
	`succeeded_at` integer,
	`message` text NOT NULL
);
