import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  product: text("product").notNull(),
  displayName: text("display_name").notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  purchaseReference: text("purchase_reference").notNull(),
  purchaseVerified: integer("purchase_verified").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
