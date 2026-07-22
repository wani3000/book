import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  picture: text("picture"),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("active"),
  marketingConsent: integer("marketing_consent").notNull().default(0),
  termsAcceptedAt: text("terms_accepted_at"),
  termsVersion: text("terms_version"),
  privacyAcceptedAt: text("privacy_accepted_at"),
  privacyVersion: text("privacy_version"),
  reactivatedAt: text("reactivated_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text("deleted_at"),
}, (table) => [uniqueIndex("members_email_unique").on(table.email)]);

export const authIdentities = sqliteTable("auth_identities", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id),
  provider: text("provider").notNull(),
  providerSubject: text("provider_subject").notNull(),
  providerEmail: text("provider_email"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("auth_identities_provider_subject_unique").on(table.provider, table.providerSubject),
  uniqueIndex("auth_identities_member_provider_unique").on(table.memberId, table.provider),
]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id),
  product: text("product").notNull(),
  productTitle: text("product_title").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("KRW"),
  status: text("status").notNull().default("paid"),
  provider: text("provider").notNull(),
  providerReference: text("provider_reference").notNull(),
  firstAccessedAt: text("first_accessed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("orders_provider_reference_unique").on(table.providerReference)]);

export const refundRequests = sqliteTable("refund_requests", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  memberId: text("member_id").notNull().references(() => members.id),
  reasonCode: text("reason_code").notNull(),
  reasonDetail: text("reason_detail").notNull(),
  status: text("status").notNull().default("requested"),
  decisionNote: text("decision_note"),
  reviewedBy: text("reviewed_by").references(() => members.id),
  requestedAt: text("requested_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  reviewedAt: text("reviewed_at"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("refund_requests_order_unique").on(table.orderId)]);

export const paymentAttempts = sqliteTable("payment_attempts", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id),
  product: text("product").notNull(),
  amount: integer("amount").notNull(),
  provider: text("provider").notNull().default("kakaopay"),
  providerReference: text("provider_reference").notNull(),
  status: text("status").notNull().default("ready"),
  errorCode: text("error_code"),
  contentProvisionConsentAt: text("content_provision_consent_at").notNull(),
  contentProvisionConsentVersion: text("content_provision_consent_version").notNull().default("2026-07-21-v1"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("payment_attempts_provider_reference_unique").on(table.providerReference)]);

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  product: text("product").notNull(),
  displayName: text("display_name").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  purchaseReference: text("purchase_reference").notNull(),
  purchaseVerified: integer("purchase_verified").notNull().default(0),
  memberId: text("member_id").references(() => members.id),
  orderId: text("order_id").references(() => orders.id),
  status: text("status").notNull().default("pending"),
  moderationReason: text("moderation_reason"),
  reviewedBy: text("reviewed_by").references(() => members.id),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("reviews_member_product_unique").on(table.memberId, table.product)]);

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorMemberId: text("actor_member_id").references(() => members.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  detail: text("detail"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const requestLimits = sqliteTable("request_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStartedAt: integer("window_started_at").notNull(),
});

export const notificationOutbox = sqliteTable("notification_outbox", {
  id: text("id").primaryKey(),
  memberId: text("member_id").references(() => members.id),
  event: text("event").notNull(),
  recipient: text("recipient").notNull(),
  payload: text("payload").notNull(),
  status: text("status").notNull().default("pending"),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  sentAt: text("sent_at"),
});
