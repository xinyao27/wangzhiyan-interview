import { Hono } from "hono";
import * as db from "@/lib/db/service";

// Create Hono instance for conversations
const conversationsApi = new Hono();

// Conversations list API
conversationsApi.get("/conversations", async (c) => {
  try {
    const conversations = await db.getAllConversations();
    return c.json({ conversations });
  } catch (error) {
    console.error("Failed to get conversations:", error);
    return c.json({ error: "Failed to get conversations" }, 500);
  }
});

// Create conversation API
conversationsApi.post("/conversations", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const id = body.id;
    const conversation = await db.createConversation({ id });
    return c.json({ conversation });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return c.json({ error: "Failed to create conversation" }, 500);
  }
});

// Get conversation API
conversationsApi.get("/conversations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const conversation = await db.getConversationById(id);

    if (!conversation) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    const messages = await db.getMessagesByConversationId(id);

    return c.json({ conversation, messages });
  } catch (error) {
    console.error("Failed to get conversation details:", error);
    return c.json({ error: "Failed to get conversation details" }, 500);
  }
});

// Delete conversation API
conversationsApi.delete("/conversations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db.deleteConversation(id);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return c.json({ error: "Failed to delete conversation" }, 500);
  }
});

export { conversationsApi };
