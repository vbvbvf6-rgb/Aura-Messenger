import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const botTokensTable = pgTable("bot_tokens", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("owner_user_id").notNull(),
  botUserId: integer("bot_user_id").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const botWebhooksTable = pgTable("bot_webhooks", {
  id: serial("id").primaryKey(),
  botUserId: integer("bot_user_id").notNull().unique(),
  url: text("url").notNull(),
  secretToken: text("secret_token"),
  lastError: text("last_error"),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const botUpdatesTable = pgTable("bot_updates", {
  id: serial("id").primaryKey(),
  botUserId: integer("bot_user_id").notNull(),
  updateId: integer("update_id").notNull(),
  payload: text("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
