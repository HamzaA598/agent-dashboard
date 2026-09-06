"use client";

import { Message } from "@/types/Message";
import { ToolExecution } from "@/types/ToolExecution";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const ChatInterface = () => {
  const { agentId } = useParams();

  const searchParams = useSearchParams();
  const threadIdSearchParam = searchParams.get("threadId");

  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSubmitting]);

  const updateUrlShallow = (newPathOrQuery: string) => {
    window.history.replaceState(null, "", newPathOrQuery);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const threadId = threadIdSearchParam ?? crypto.randomUUID();
    if (!threadIdSearchParam)
      updateUrlShallow(`?tab=chat&threadId=${threadId}`);

    const promptToSend = input.trim();
    if (!promptToSend || isSubmitting) return;

    setInput("");
    setIsSubmitting(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: String(prevMessages.length),
        role: "user",
        content: promptToSend,
      },
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        threadId,
        prompt: promptToSend,
      }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: String(prevMessages.length),
        role: "assistant",
        content: "",
      },
    ]);
    const utf8Decoder = new TextDecoder("utf-8");

    let content = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = utf8Decoder.decode(value, { stream: true });
      content += chunk;
      const lines = content.split("\n\n");

      const nextContent = lines.pop() ?? "";

      let assistantMessageContentDiff = "";
      for (const line of lines) {
        if (line.includes("[DONE]")) break;

        if (line.startsWith("data: ")) {
          const stripped = line.replace("data: ", "");
          const json = JSON.parse(stripped);

          if (json["type"] === "tool-call") {
            setMessages((prevMessages) => {
              const nextMessages = [...prevMessages];
              const targetIndex = nextMessages.length - 1;

              nextMessages[targetIndex] = {
                ...nextMessages[targetIndex],
                toolExecutions: [
                  ...(nextMessages[targetIndex].toolExecutions ?? []),
                  {
                    id: json["id"],
                    toolName: json["toolName"],
                    input: json["input"],
                    status: "pending",
                  },
                ],
              };

              return nextMessages;
            });
          } else if (json["type"] === "tool-result") {
            setMessages((prevMessages) => {
              const nextMessages = [...prevMessages];
              const targetIndex = nextMessages.length - 1;

              nextMessages[targetIndex] = {
                ...nextMessages[targetIndex],
                toolExecutions: [
                  ...(nextMessages[targetIndex].toolExecutions?.map(
                    (toolExecution) => {
                      if (toolExecution.id === json["id"]) {
                        const newToolExecution: ToolExecution = {
                          id: json["id"],
                          toolName: json["toolName"],
                          input: json["input"],
                          output: json["output"],
                          status: "success",
                        };
                        return newToolExecution;
                      }
                      return toolExecution;
                    },
                  ) ?? []),
                ],
              };

              return nextMessages;
            });
          } else if (json["type"] === "text-delta")
            assistantMessageContentDiff += json["text"];
        }
      }

      const delta = assistantMessageContentDiff;
      setMessages((prevMessages) => {
        const nextMessages = [...prevMessages];
        const targetIndex = nextMessages.length - 1;

        nextMessages[targetIndex] = {
          ...nextMessages[targetIndex],
          content: nextMessages[targetIndex].content + delta,
        };

        return nextMessages;
      });

      content = nextContent;
      assistantMessageContentDiff = "";
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex h-[620px] w-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header / Session Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSubmitting ? "animate-ping bg-blue-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isSubmitting ? "bg-blue-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
            {isSubmitting
              ? "Generating Response..."
              : "Streaming Agent Connected"}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
          >
            Clear conversation
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Interactive Agent Sandbox
            </h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              Send a prompt to stream tokens in real-time. Try asking
              mathematical questions to test the calculator tool!
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                "Multiply 347 by 28",
                "What is 1024 divided by 16?",
                "Add 2048 and 4096",
              ].map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => setInput(promptText)}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
                >
                  &ldquo;{promptText}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "user";
            const isLast = index === messages.length - 1;
            const isEmptyAssistant = !isUser && message.content === "";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start items-start"}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    AI
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-xs break-words ${
                    isUser
                      ? "rounded-tr-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 max-w-[85%]"
                      : "rounded-tl-xs border border-zinc-200/80 bg-zinc-50 text-zinc-900 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-100 max-w-[85%] whitespace-pre-wrap leading-relaxed"
                  }`}
                >
                  {/* Tool Invocations Section */}
                  {(message.toolExecutions?.length ?? 0) > 0 && (
                    <div className="mb-2.5 space-y-2 border-b border-zinc-200/60 pb-2.5 dark:border-zinc-700/50">
                      {message.toolExecutions?.map((toolExecution) => {
                        return (
                          <div
                            key={toolExecution.id}
                            className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100/70 font-mono text-xs dark:border-zinc-700/70 dark:bg-zinc-800/80"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-200/60 bg-zinc-200/40 px-2.5 py-1.5 dark:border-zinc-700/50 dark:bg-zinc-800">
                              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                                <svg
                                  className="h-3.5 w-3.5 text-amber-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="font-semibold">
                                  {toolExecution.toolName}
                                </span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                  toolExecution.status === "success"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                }`}
                              >
                                {toolExecution.status === "success"
                                  ? "Executed"
                                  : "Calling..."}
                              </span>
                            </div>
                            <div className="space-y-1.5 p-2">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                                  Input
                                </span>
                                <pre className="mt-0.5 overflow-x-auto rounded bg-zinc-200/50 p-1.5 text-[11px] text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                                  {JSON.stringify(toolExecution.input, null, 2)}
                                </pre>
                              </div>
                              {toolExecution.status === "success" && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                                    Result
                                  </span>
                                  <pre className="mt-0.5 overflow-x-auto rounded bg-emerald-500/10 p-1.5 text-[11px] text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    {JSON.stringify(
                                      toolExecution.output,
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isEmptyAssistant ? (
                    <div className="flex items-center gap-1.5 py-1 px-1">
                      <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
                      <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse [animation-delay:200ms]" />
                      <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse [animation-delay:400ms]" />
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-zinc-200 bg-zinc-50/50 p-3 sm:p-4 rounded-b-xl dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or enter a calculation..."
          disabled={isSubmitting}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span>Send</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
