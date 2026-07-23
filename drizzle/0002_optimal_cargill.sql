CREATE TABLE `payment_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`product` text NOT NULL,
	`amount` integer NOT NULL,
	`provider` text DEFAULT 'kakaopay' NOT NULL,
	`provider_reference` text NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`error_code` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_attempts_provider_reference_unique` ON `payment_attempts` (`provider_reference`);