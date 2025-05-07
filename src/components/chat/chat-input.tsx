import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";

interface ChatInputProps {
  isLoading: boolean;
  onSubmit: (message: string) => void;
  onStop?: () => void;
}

export function ChatInput({ isLoading, onSubmit, onStop }: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  // Handle sending message
  const handleSubmit = () => {
    if (!message.trim() || isLoading) return;

    startTransition(() => {
      onSubmit(message);
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle input auto-height adjustment
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-end gap-2 border rounded-lg p-2 bg-background"
    >
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Enter message..."
        className="min-h-10 max-h-[200px] resize-none border-0 focus-visible:ring-0 p-2"
        disabled={isLoading}
      />
      {isLoading ? (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          onClick={onStop}
          className="rounded-full shrink-0 h-10 w-10"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <Button
          type="button"
          size="icon"
          onClick={handleSubmit}
          disabled={!message.trim() || isPending}
          className="rounded-full shrink-0 h-10 w-10"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
