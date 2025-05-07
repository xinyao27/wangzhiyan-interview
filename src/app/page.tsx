import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";

export default function Home() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">AI Assistant</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}
