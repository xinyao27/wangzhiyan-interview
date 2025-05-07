import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2, Image as ImageIcon, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ChatInputProps {
  isLoading: boolean;
  onSubmit: (message: string, imageUrl?: string) => void;
  onStop?: () => void;
}

export function ChatInput({ isLoading, onSubmit, onStop }: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Handle sending message
  const handleSubmit = async () => {
    if ((!message.trim() && !imagePreview) || isLoading || isUploading) return;

    let uploadedImageUrl: string | undefined;

    // If there's an image, upload it first
    if (imageFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        const data = await response.json();
        uploadedImageUrl = data.imageUrl;
        console.log("Image uploaded successfully:", uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
        return;
      } finally {
        setIsUploading(false);
      }
    }

    startTransition(() => {
      onSubmit(message, uploadedImageUrl);
      setMessage("");
      setImageFile(null);
      setImagePreview(null);

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Clear selected image
  const handleClearImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Image preview */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-32 h-32 mx-auto mb-2"
        >
          <Image
            src={imagePreview}
            alt="Selected image"
            className="rounded-md object-cover"
            fill
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={handleClearImage}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>
        </motion.div>
      )}

      {/* Input area */}
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
          disabled={isLoading || isUploading}
        />
        <div className="flex flex-row gap-2">
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
              disabled={
                (!message.trim() && !imagePreview) || isPending || isUploading
              }
              className="rounded-full shrink-0 h-10 w-10"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          )}

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleImageButtonClick}
            className="rounded-full shrink-0 h-10 w-10"
            disabled={isLoading || isUploading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
        </div>
      </motion.div>
    </div>
  );
}
