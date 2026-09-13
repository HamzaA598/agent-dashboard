import ChatInterface from "./components/chat-interface";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-zinc-50 p-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:p-8 flex flex-col">
      <div className="mx-auto w-full max-w-5xl flex-1 flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Global Agent Orchestrator Chat
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Direct gateway to the root orchestrator. Sub-agents (Coder, Calculator, Researcher) are dynamically coordinated via tool delegation.
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          <Suspense
            fallback={
              <div className="flex h-[720px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-white p-8 text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
                Loading chat interface...
              </div>
            }
          >
            <ChatInterface />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
