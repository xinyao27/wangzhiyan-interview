import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "../utils";

// Conversations table
export const conversations = sqliteTable("conversations", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Messages table
export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", {
    enum: ["user", "assistant", "system"],
  }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Database types
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
