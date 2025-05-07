import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/lib/db/schema";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: Message;
  isLastMessage?: boolean;
}

export function ChatMessage({ message, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full items-start gap-4 p-4",
        isUser ? "bg-transparent" : "bg-muted/30",
        isLastMessage && "scroll-mt-32"
      )}
      id={message.id}
    >
      <Avatar
        className={cn(
          "h-8 w-8 justify-center items-center",
          isUser ? "bg-primary" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </Avatar>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="font-semibold">{isUser ? "You" : "Assistant"}</div>
        <div className="prose prose-sm max-w-none dark:prose-invert break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
