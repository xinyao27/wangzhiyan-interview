import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/lib/db/schema";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ChatMessageProps {
  message: Message;
  isLastMessage?: boolean;
}

const IMAGE_URL_REGEX = /\[imageUrl\]\((https?:\/\/[^\s)]+)\)/;

export function ChatMessage({ message, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [imageError, setImageError] = useState(false);
  const [extractedImageUrl, setExtractedImageUrl] = useState<string | null>(
    null
  );

  // 尝试从消息内容中提取图片URL
  useEffect(() => {
    if (message.content) {
      const match = message.content.match(IMAGE_URL_REGEX);
      if (match && match[1]) {
        setExtractedImageUrl(match[1]);
      }
    }
  }, [message.content]);

  // 确定要显示的内容（移除图片链接文本）
  const displayContent = message.content?.replace(IMAGE_URL_REGEX, "") || "";

  // 确定要显示的图片URL（优先使用imageUrl属性，其次使用从内容提取的URL）
  const displayImageUrl = message.imageUrl || extractedImageUrl;

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

        {/* waiting for response */}
        {!isUser && !displayContent && (
          <div className="text-sm flex">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse" style={{ animationDelay: "300ms" }}>
              .
            </span>
            <span className="animate-pulse" style={{ animationDelay: "600ms" }}>
              .
            </span>
          </div>
        )}

        {/* Display image if available */}
        {displayImageUrl && !imageError && (
          <div className="relative w-64 h-64 mb-4 bg-slate-100 rounded-md">
            <Image
              src={displayImageUrl}
              alt="Attached image"
              className="rounded-md object-contain"
              fill
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Show error message if image fails to load */}
        {displayImageUrl && imageError && (
          <div className="p-2 mb-4 bg-red-50 text-red-800 rounded-md flex items-center gap-2">
            <span>Failed to load image</span>
            <a
              href={displayImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              Open image in new tab
            </a>
          </div>
        )}

        <div className="prose prose-sm max-w-none dark:prose-invert break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayContent}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
