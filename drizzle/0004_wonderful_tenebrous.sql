CREATE TABLE `refund_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`member_id` text NOT NULL,
	`reason_code` text NOT NULL,
	`reason_detail` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`decision_note` text,
	`reviewed_by` text,
	`requested_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewed_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refund_requests_order_unique` ON `refund_requests` (`order_id`);--> statement-breakpoint
ALTER TABLE `orders` ADD `first_accessed_at` text;