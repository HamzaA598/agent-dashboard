import { delay } from "@/utils/delay";

export const POST = async (req: Request) => {
  const { prompt } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`data: {"text": "hello"}\n\n`));
      await delay(300);
      controller.enqueue(encoder.encode(`data: {"text": "how"}\n\n`));

      await delay(300);
      controller.enqueue(encoder.encode(`data: {"text": "are"}\n\n`));

      await delay(300);
      controller.enqueue(encoder.encode(`data: {"text": "you?"}\n\n`));

      await delay(300);
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
