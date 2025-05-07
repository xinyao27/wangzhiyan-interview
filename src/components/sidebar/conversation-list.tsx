"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { nanoid } from "nanoid";
import { API_ROUTES } from "@/lib/constants";
import { Conversation } from "@/lib/db/schema";
import {
  CONVERSATION_CREATED_EVENT,
  CONVERSATION_UPDATED_EVENT,
} from "../chat/chat-window";

export function ConversationList() {
  const router = useRouter();
  const params = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch conversation list
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_ROUTES.conversations);
      const data = await res.json();

      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to get conversation list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new conversation
  const handleCreateConversation = async () => {
    try {
      const id = nanoid();

      // Create conversation first, then redirect
      const response = await fetch(API_ROUTES.conversations, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        router.push(`/chat/${id}`);
        await fetchConversations();
      } else {
        console.error(
          "Failed to create conversation, status code:",
          response.status
        );
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDeleting) return;

    try {
      setIsDeleting(id);
      await fetch(`${API_ROUTES.conversations}/${id}`, {
        method: "DELETE",
      });

      setConversations((prev) => prev.filter((conv) => conv.id !== id));

      // If deleting the current conversation, navigate to home
      if (params?.id === id) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Listen for conversation created and updated events
  useEffect(() => {
    const handleConversationEvent = () => {
      fetchConversations();
    };

    // Add event listeners
    window.addEventListener(
      CONVERSATION_CREATED_EVENT,
      handleConversationEvent
    );
    window.addEventListener(
      CONVERSATION_UPDATED_EVENT,
      handleConversationEvent
    );

    // Cleanup function, remove event listeners
    return () => {
      window.removeEventListener(
        CONVERSATION_CREATED_EVENT,
        handleConversationEvent
      );
      window.removeEventListener(
        CONVERSATION_UPDATED_EVENT,
        handleConversationEvent
      );
    };
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="flex flex-col h-full p-2">
      <div className="p-2">
        <Button
          onClick={handleCreateConversation}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversation history
          </div>
        ) : (
          conversations.map((conversation) => {
            const isActive = params?.id === conversation.id;
            const isCurrentDeleting = isDeleting === conversation.id;

            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <Button
                  onClick={() => router.push(`/chat/${conversation.id}`)}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-2 pr-10"
                  disabled={isCurrentDeleting}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </Button>

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-7 w-7 opacity-0 group-hover:opacity-100 ${
                      isCurrentDeleting ? "opacity-100" : ""
                    }`}
                    onClick={(e) =>
                      handleDeleteConversation(conversation.id, e)
                    }
                    disabled={isCurrentDeleting}
                  >
                    {isCurrentDeleting ? (
                      <Skeleton className="h-4 w-4 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
