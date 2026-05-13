import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { chatsTable } from "./chats";
import { messagesTable } from "./messages";
import { usersTable } from "./users";

export const pinnedMessagesTable = pgTable("pinned_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull().references(() => chatsTable.id),
  messageId: integer("message_id").notNull().references(() => messagesTable.id),
  pinnedBy: integer("pinned_by").notNull().references(() => usersTable.id),
  pinnedAt: timestamp("pinned_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PinnedMessage = typeof pinnedMessagesTable.$inferSelect;
