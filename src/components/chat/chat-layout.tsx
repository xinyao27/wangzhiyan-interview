import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatWindow, ChatWindowProps } from "@/components/chat/chat-window";

export function ChatLayout({ ...props }: ChatWindowProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold lg:pl-0 pl-5">AI Assistant</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatWindow {...props} />
        </div>
      </main>
    </div>
  );
}
