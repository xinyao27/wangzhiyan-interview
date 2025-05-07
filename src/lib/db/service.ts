import { db } from "./index";
import {
  conversations,
  messages,
  type Conversation,
  type Message,
  type NewConversation,
  type NewMessage,
} from "./schema";
import { desc, eq } from "drizzle-orm";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";

// Get all conversations
export async function getAllConversations(): Promise<Conversation[]> {
  return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
}

// Get a single conversation
export async function getConversationById(
  id: string
): Promise<Conversation | undefined> {
  const results = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return results[0];
}

// Create conversation
export async function createConversation(
  data: Partial<NewConversation> = {}
): Promise<Conversation> {
  const title = data.title || DEFAULT_CONVERSATION_TITLE;
  const newConversation: NewConversation = {
    title,
    ...data,
  };

  const [conversation] = await db
    .insert(conversations)
    .values(newConversation)
    .returning();
  return conversation;
}

// Update conversation
export async function updateConversation(
  id: string,
  data: Partial<NewConversation>
): Promise<Conversation | undefined> {
  const [conversation] = await db
    .update(conversations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();

  return conversation;
}

// Delete conversation
export async function deleteConversation(id: string): Promise<void> {
  await db.delete(conversations).where(eq(conversations.id, id));
}

// Get conversation messages
export async function getMessagesByConversationId(
  conversationId: string
): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

// Create message
export async function createMessage(data: NewMessage): Promise<Message> {
  const [message] = await db.insert(messages).values(data).returning();

  // Update conversation's updatedAt time
  await updateConversation(data.conversationId, {});

  return message;
}

// Create multiple messages
export async function createMessages(
  messagesData: NewMessage[]
): Promise<Message[]> {
  if (!messagesData.length) return [];

  const createdMessages = await db
    .insert(messages)
    .values(messagesData)
    .returning();

  // Get the conversationId from the first message
  const conversationId = messagesData[0].conversationId;

  // Update conversation's updatedAt time
  await updateConversation(conversationId, {});

  return createdMessages;
}

// Delete all messages for a conversation
export async function deleteMessagesByConversationId(
  conversationId: string
): Promise<void> {
  await db.delete(messages).where(eq(messages.conversationId, conversationId));
}
