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
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("orders_provider_reference_unique").on(table.providerReference)]);

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
