CREATE TABLE `auth_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_subject` text NOT NULL,
	`provider_email` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_login_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_identities_provider_subject_unique` ON `auth_identities` (`provider`,`provider_subject`);--> statement-breakpoint
CREATE UNIQUE INDEX `auth_identities_member_provider_unique` ON `auth_identities` (`member_id`,`provider`);--> statement-breakpoint
INSERT INTO `auth_identities` (`id`,`member_id`,`provider`,`provider_subject`,`provider_email`,`created_at`,`last_login_at`)
SELECT 'legacy-google:' || `id`, `id`, 'google', `id`, `email`, `created_at`, `last_login_at`
FROM `members`;
