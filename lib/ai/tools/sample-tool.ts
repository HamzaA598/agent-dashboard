import { delay } from "@/utils/delay";
import { tool } from "ai";
import { z } from "zod";

export const sampleTool = tool({
  description: "always call this tool",
  parameters: z.object({
    value: z.string().describe("Input argument required for the operation"),
  }),
  execute: async ({
    value,
  }: {
    value: string;
  }): Promise<{ output: string }> => {
    // Perform server-side logic (read DB, compute, call third-party API)
    await delay(1000);
    return { output: `Processed ${value}` };
  },
});
