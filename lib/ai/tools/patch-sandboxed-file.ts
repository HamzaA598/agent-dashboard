import { countOccurrences } from "@/utils/countOccurrences";
import Sandbox from "@e2b/code-interpreter";
import { tool } from "ai";
import z from "zod";

export const createPatchSandboxedFileTool = (sandbox: Sandbox) => {
  return tool({
    description:
      "Perform a surgical search-and-replace edit on an existing file on the isolated sandbox disk. Use this tool instead of rewriting the entire file to conserve context window tokens and prevent truncation. The target content must match exactly and appear strictly once in the file.",
    inputSchema: z.object({
      path: z
        .string()
        .describe(
          "The absolute or relative file path on the sandbox filesystem (e.g., '/home/user/workspace/src/app.ts').",
        ),
      targetContentToChange: z
        .string()
        .describe(
          "The exact block of code/text currently in the file to replace. Must match the existing file content character-for-character, and appear exactly once in the file.",
        ),
      replacementContent: z
        .string()
        .describe(
          "The new code/text to substitute in place of targetContentToChange.",
        ),
    }),
    execute: async ({ path, targetContentToChange, replacementContent }) => {
      const rawFileContent = await sandbox.files.read(path);
      const fileContent = rawFileContent.replace(/\r\n/g, "\n");
      const normalizedTarget = targetContentToChange.replace(/\r\n/g, "\n");
      const normalizedReplacement = replacementContent.replace(/\r\n/g, "\n");

      const occurrences = countOccurrences(fileContent, normalizedTarget);

      if (occurrences === 0) {
        return {
          success: false,
          error:
            "Target content not found in file. Please read the file first to verify the exact text, whitespace, and indentation.",
        };
      }

      if (occurrences > 1) {
        return {
          success: false,
          error: `Ambiguous match: target content was found ${occurrences} times in the file. Include more surrounding context lines to make the match unique.`,
        };
      }

      const updated = fileContent.replace(
        normalizedTarget,
        normalizedReplacement,
      );
      await sandbox.files.write(path, updated);

      return {
        success: true,
        path,
        message: "File patched successfully.",
      };
    },
  });
};
