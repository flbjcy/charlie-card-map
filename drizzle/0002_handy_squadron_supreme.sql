CREATE TABLE `traffic` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`created_at` integer NOT NULL,
	`source` text NOT NULL,
	`device` text NOT NULL,
	`visit` integer NOT NULL
);
