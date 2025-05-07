"use client";
import { useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { Message as DbMessage } from "@/lib/db/schema";
import { motion } from "framer-motion";
import { ChatMessage } from "./message";
import { ChatInput } from "./chat-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@ai-sdk/react";
import { API_ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

// Define valid role types
type ValidRole = "user" | "assistant" | "system";

// Define custom event names
export const CONVERSATION_CREATED_EVENT = "conversation-created";
export const CONVERSATION_UPDATED_EVENT = "conversation-updated";

export interface ChatWindowProps {
  conversationId?: string;
  initialMessages?: DbMessage[];
}

export function ChatWindow({
  conversationId,
  initialMessages = [],
}: ChatWindowProps) {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Generate a unique ID to ensure it works even without a conversationId
  const generatedId = useRef(nanoid());
  const isFirstMessage = useRef(
    !conversationId && initialMessages.length === 0
  );
  const isExistingConversation = useRef(!!conversationId);

  const convertedMessages = initialMessages.map((msg) => {
    let role: ValidRole = "assistant";
    if (msg.role === "user" || msg.role === "system") {
      role = msg.role;
    }

    return {
      id: msg.id,
      role: role,
      content: msg.content,
    };
  });

  // Using custom hook to manage chat
  const { messages, status, append, stop } = useChat({
    api: API_ROUTES.agent,
    initialMessages: convertedMessages,
    id: conversationId || generatedId.current,
    maxSteps: 5,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // When sending the first message from the homepage, send an event to notify the sidebar to update
  useEffect(() => {
    if (isFirstMessage.current && messages.length >= 2) {
      isFirstMessage.current = false;

      // Send custom event to notify sidebar to refresh conversation list
      const event = new CustomEvent(CONVERSATION_CREATED_EVENT, {
        detail: { conversationId: generatedId.current },
      });
      window.dispatchEvent(event);

      // If on homepage, navigate to the newly created conversation page
      if (!conversationId) {
        router.push(`/chat/${generatedId.current}`);
      }
    }
  }, [messages, conversationId, router]);

  // When existing conversation receives a new message, notify the sidebar to update
  useEffect(() => {
    if (
      isExistingConversation.current &&
      messages.length > initialMessages.length &&
      messages.length >= 2
    ) {
      // Send custom event to notify sidebar to refresh conversation list for title updates
      const event = new CustomEvent(CONVERSATION_UPDATED_EVENT, {
        detail: { conversationId: conversationId },
      });
      window.dispatchEvent(event);
    }
  }, [messages.length, initialMessages.length, conversationId]);

  return (
    <div className="flex flex-col h-full">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
      >
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center space-y-4 px-4">
              <h2 className="text-xl font-bold">Start a New Conversation</h2>
              <p className="text-muted-foreground">
                Enter a message to start chatting with the AI assistant
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="pb-20">
            {messages.map((message, i) => {
              let dbRole: DbMessage["role"] = "assistant";
              if (message.role === "user" || message.role === "system") {
                dbRole = message.role;
              }

              return (
                <ChatMessage
                  key={message.id}
                  message={{
                    id: message.id,
                    role: dbRole,
                    content: message.content,
                    conversationId: conversationId || generatedId.current,
                    createdAt: new Date(),
                  }}
                  isLastMessage={i === messages.length - 1}
                />
              );
            })}
            {status === "submitted" && (
              <div className="p-4 flex items-start gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 sticky bottom-0 bg-background">
        <ChatInput
          isLoading={isLoading}
          onSubmit={(userMessage: string) => {
            append({
              role: "user",
              content: userMessage,
            });
          }}
          onStop={stop}
        />
      </div>
    </div>
  );
}
