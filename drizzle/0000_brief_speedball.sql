CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product` text NOT NULL,
	`display_name` text NOT NULL,
	`rating` integer NOT NULL,
	`content` text NOT NULL,
	`purchase_reference` text NOT NULL,
	`purchase_verified` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
