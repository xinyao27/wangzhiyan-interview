import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Chat Conversation</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatWindow conversationId={id} initialMessages={messages} />
        </div>
      </main>
    </div>
  );
}
