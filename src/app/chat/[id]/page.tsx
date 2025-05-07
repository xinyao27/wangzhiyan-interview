import { ChatLayout } from "@/components/chat/chat-layout";
import { API_ROUTES } from "@/lib/constants";
import { Message } from "@/lib/db/schema";
import { buildApiUrl } from "@/lib/utils";

interface ChatPageProps {
  params: {
    id: string;
  };
}

async function getConversationMessages(id: string): Promise<Message[]> {
  try {
    const apiUrl = buildApiUrl(`${API_ROUTES.conversations}/${id}`);

    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to get conversation, status code: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.messages || [];
  } catch (error) {
    console.error("Failed to get conversation messages:", error);
    return [];
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const messages = await getConversationMessages(id);

  return <ChatLayout conversationId={id} initialMessages={messages} />;
}
