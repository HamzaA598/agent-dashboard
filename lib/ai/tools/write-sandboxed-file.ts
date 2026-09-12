import Sandbox from "@e2b/code-interpreter";
import { tool } from "ai";
import z from "zod";

export const createWriteSandboxedFileTool = (sandbox: Sandbox) => {
  return tool({
    description:
      "Write or overwrite a file on the isolated sandbox disk. If parent directories or the file do not exist, they are created automatically. If the file already exists, it is completely overwritten.",
    inputSchema: z.object({
      path: z
        .string()
        .describe(
          "The absolute or relative file path on the sandbox filesystem (e.g., '/home/user/workspace/src/app.ts').",
        ),
      content: z
        .string()
        .describe("The full string content to write to the file."),
    }),
    execute: async ({ path, content }) => {
      return await sandbox.files.write(path, content);
    },
  });
};
