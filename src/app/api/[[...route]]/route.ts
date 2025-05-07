import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { streamText } from "ai";
import { deepseek } from "@/lib/ai";
import * as db from "@/lib/db/service";
import { DEFAULT_CONVERSATION_TITLE } from "@/lib/constants";
import { tools } from "@/lib/tools";

// Create Hono instance
const app = new Hono().basePath("/api");

// Conversations list API
app.get("/conversations", async (c) => {
  try {
    const conversations = await db.getAllConversations();
    return c.json({ conversations });
  } catch (error) {
    console.error("Failed to get conversations:", error);
    return c.json({ error: "Failed to get conversations" }, 500);
  }
});

// Create conversation API
app.post("/conversations", async (c) => {
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
app.get("/conversations/:id", async (c) => {
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
app.delete("/conversations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db.deleteConversation(id);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return c.json({ error: "Failed to delete conversation" }, 500);
  }
});

// Conversation request schema
const messageSchema = z.object({
  id: z.string(),
  messages: z.any(),
});

// AI Agent API
app.post("/agent", zValidator("json", messageSchema), async (c) => {
  try {
    const { id: conversationId, messages } = c.req.valid("json");

    // Get conversation
    let conversation = await db.getConversationById(conversationId);

    const firstMessage = messages[0];
    const currentMessage = messages[messages.length - 1];

    // Generate title from first user message
    const title =
      firstMessage.content.slice(0, 30) +
      (firstMessage.content.length > 30 ? "..." : "");

    // If conversation doesn't exist, create a new one
    if (!conversation) {
      conversation = await db.createConversation({
        id: conversationId,
        title: title,
      });
    } else if (conversation.title === DEFAULT_CONVERSATION_TITLE) {
      conversation = await db.updateConversation(conversationId, { title });
    }

    // Save user message
    if (currentMessage.role === "user") {
      await db.createMessage({
        conversationId,
        role: "user",
        content: currentMessage.content,
      });
    }

    const result = streamText({
      model: deepseek,
      messages,
      tools,
      maxSteps: 3,
      async onFinish(res) {
        await db.createMessage({
          conversationId,
          role: "assistant",
          content: res.text,
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI request processing failed:", error);
    return c.json({ error: "AI request processing failed" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
