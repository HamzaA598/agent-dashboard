"use client";

import { Message } from "@/types/Message";
import { useState } from "react";

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: String(prevMessages.length),
        role: "user",
        content: input,
      },
    ]);

    const response = await fetch("/api/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
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
          assistantMessageContentDiff += json["text"];
        }
      }

      const delta = assistantMessageContentDiff;
      setMessages((prevMessages) => {
        console.log(
          "🔍 [1] setMessages called! prevMessages length:",
          prevMessages.length,
        );
        const nextMessages = [...prevMessages];
        const targetIndex = nextMessages.length - 1;

        console.log(
          "🔍 [2] targetIndex:",
          targetIndex,
          "Target item role:",
          nextMessages[targetIndex]?.role,
        );
        console.log("🔍 [3] Old content:", nextMessages[targetIndex]?.content);
        console.log("🔍 [4] assistantMessageContentDiff to add:", delta);

        nextMessages[targetIndex] = {
          ...nextMessages[targetIndex],
          content: nextMessages[targetIndex].content + delta,
        };

        console.log(
          "🔍 [5] Resulting content after addition:",
          JSON.stringify(nextMessages[targetIndex].content),
        );

        return nextMessages;
      });

      content = nextContent;
      assistantMessageContentDiff = "";
    }

    setIsSubmitting(false);
  };

  console.log("[RENDER] Messages currently in state:", messages);

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
