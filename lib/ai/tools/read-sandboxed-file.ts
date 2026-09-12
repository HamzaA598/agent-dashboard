import { sliceLines } from "@/utils/sliceLines";
import Sandbox from "@e2b/code-interpreter";
import { tool } from "ai";
import z from "zod";

export const createReadSandboxedFileTool = (sandbox: Sandbox) => {
  return tool({
    description:
      "Read file contents from the isolated sandbox disk. Supports targeted line-range slicing (startLine to endLine) to inspect specific code sections while conserving the LLM context window. Lines are 1-based.",
    inputSchema: z
      .object({
        path: z
          .string()
          .describe(
            "The absolute or relative path of the file to read on the sandbox filesystem (e.g., '/home/user/workspace/src/index.ts')",
          ),
        startLine: z
          .number()
          .int()
          .positive()
          .default(1)
          .describe(
            "The 1-based line number to start reading from (inclusive). Defaults to 1.",
          ),
        endLine: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "The 1-based line number to stop reading at (inclusive). If omitted, reads to the end of the file.",
          ),
      })
      .refine(
        (data) => {
          if (data.endLine !== undefined && data.startLine > data.endLine) {
            return false;
          }
          return true;
        },
        {
          message: "startLine cannot be greater than endLine",
          path: ["startLine", "endLine"],
        },
      ),
    execute: async ({ path, startLine, endLine }) => {
      const fileContent = await sandbox.files.read(path);
      const totalLines = fileContent.split(/\r?\n/).length;
      const effectiveEndLine = endLine ?? totalLines;

      return sliceLines(fileContent, startLine, effectiveEndLine);
    },
  });
};
