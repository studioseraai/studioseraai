CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`artwork_id` integer NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`category` text NOT NULL,
	`hash` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`artwork_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
