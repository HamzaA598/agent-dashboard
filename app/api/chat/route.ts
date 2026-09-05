import { runAgent } from "@/lib/ai/agent";

export const POST = async (req: Request) => {
  const { prompt } = await req.json();

  const result = runAgent({ input: prompt });

  const encoder = new TextEncoder();

  // 2. Wrap in ReadableStream matching our frontend SSE contract
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Iterate over text tokens as the model generates them
        for await (const chunk of result.textStream) {
          const payload = JSON.stringify({ text: chunk });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        }
        // Send our termination token
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  // 3. Return standard SSE HTTP response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
