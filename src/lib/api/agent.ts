import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { streamText } from "ai";
import { deepseek } from "@/lib/ai";
import * as db from "@/lib/db/service";
import { DEFAULT_CONVERSATION_TITLE } from "@/lib/constants";
import { tools } from "@/lib/tools";

// Create Hono instance for agent
const agentApi = new Hono();

// Conversation request schema
const messageSchema = z.object({
  id: z.string(),
  messages: z.any(),
});

// AI Agent API
agentApi.post("/agent", zValidator("json", messageSchema), async (c) => {
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
        imageUrl: currentMessage.imageUrl,
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

export { agentApi };
