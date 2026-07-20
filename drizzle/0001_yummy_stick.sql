CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`picture` text,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`marketing_consent` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_email_unique` ON `members` (`email`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`product` text NOT NULL,
	`product_title` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'KRW' NOT NULL,
	`status` text DEFAULT 'paid' NOT NULL,
	`provider` text NOT NULL,
	`provider_reference` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_provider_reference_unique` ON `orders` (`provider_reference`);--> statement-breakpoint
ALTER TABLE `reviews` ADD `member_id` text REFERENCES members(id);