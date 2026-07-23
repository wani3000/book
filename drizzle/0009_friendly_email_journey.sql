ALTER TABLE `members` ADD `notification_email` text;
ALTER TABLE `members` ADD `pending_notification_email` text;
ALTER TABLE `members` ADD `notification_email_token_hash` text;
ALTER TABLE `members` ADD `notification_email_token_expires_at` text;
ALTER TABLE `members` ADD `notification_email_verified_at` text;

ALTER TABLE `notification_outbox` ADD `attempt_count` integer DEFAULT 0 NOT NULL;
ALTER TABLE `notification_outbox` ADD `provider_message_id` text;
ALTER TABLE `notification_outbox` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;
