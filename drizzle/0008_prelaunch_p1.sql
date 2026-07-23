ALTER TABLE `reviews` ADD `order_id` text REFERENCES orders(id);
ALTER TABLE `reviews` ADD `moderation_reason` text;
ALTER TABLE `reviews` ADD `reviewed_by` text REFERENCES members(id);
ALTER TABLE `reviews` ADD `reviewed_at` text;
ALTER TABLE `reviews` ADD `updated_at` text NOT NULL DEFAULT CURRENT_TIMESTAMP;
DELETE FROM `reviews` WHERE `member_id` IS NOT NULL AND `id` NOT IN (SELECT MAX(`id`) FROM `reviews` WHERE `member_id` IS NOT NULL GROUP BY `member_id`,`product`);
CREATE UNIQUE INDEX `reviews_member_product_unique` ON `reviews` (`member_id`,`product`);

CREATE TABLE `audit_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `actor_member_id` text REFERENCES members(id),
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `detail` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);

CREATE TABLE `request_limits` (
  `key` text PRIMARY KEY NOT NULL,
  `count` integer DEFAULT 0 NOT NULL,
  `window_started_at` integer NOT NULL
);

CREATE TABLE `notification_outbox` (
  `id` text PRIMARY KEY NOT NULL,
  `member_id` text REFERENCES members(id),
  `event` text NOT NULL,
  `recipient` text NOT NULL,
  `payload` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `last_error` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `sent_at` text
);
