import ChatInterface from "./components/chat-interface";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <main className="h-[calc(100vh-57px)] w-full overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            Loading chat interface...
          </div>
        }
      >
        <ChatInterface />
      </Suspense>
    </main>
  );
}
