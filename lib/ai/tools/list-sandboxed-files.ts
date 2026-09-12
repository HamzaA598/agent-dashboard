import Sandbox from "@e2b/code-interpreter";
import { tool } from "ai";
import z from "zod";

export const createListSandboxedFileTool = (sandbox: Sandbox) => {
  return tool({
    description:
      "List files and subdirectories within a specified directory on the isolated sandbox disk. Use this tool to explore project layout, find file paths, and navigate directory structures without bloating the LLM context window.",
    inputSchema: z.object({
      path: z
        .string()
        .default("/home/user")
        .describe(
          "The directory path on the sandbox filesystem to list (e.g., '/home/user' or '/home/user/workspace'). Defaults to '/home/user'.",
        ),
    }),
    execute: async ({ path }) => {
      const entries = await sandbox.files.list(path);
      return entries.map((entry) => ({
        name: entry.name,
        type: entry.type,
      }));
    },
  });
};
