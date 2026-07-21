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
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
