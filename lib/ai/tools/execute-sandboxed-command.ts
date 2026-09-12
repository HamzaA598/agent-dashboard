import { truncateOutput } from "@/utils/truncateOutput";
import Sandbox, { CommandExitError } from "@e2b/code-interpreter";
import { tool } from "ai";
import z from "zod";

export const createExecuteSandboxedCommandTool = (sandbox: Sandbox) => {
  return tool({
    description:
      "Execute a shell command inside the isolated Linux sandbox micro-VM. Use this to run scripts, execute test suites, run package managers, or inspect system state. Returns stdout, stderr, and the command exit code.",
    inputSchema: z.object({
      command: z
        .string()
        .describe(
          "The shell command to execute inside the sandbox (e.g., 'npm test', 'ls -la', 'python3 main.py').",
        ),
      path: z
        .string()
        .optional()
        .describe(
          "The working directory inside the sandbox to execute the command in (e.g., '/home/user/workspace'). Defaults to the current user home directory.",
        ),
      timeoutMs: z
        .number()
        .default(30000)
        .describe(
          "Command execution timeout in milliseconds. Defaults to 30000 (30 seconds).",
        ),
      outputMaxLength: z
        .number()
        .default(8000)
        .describe(
          "Maximum characters allowed for stdout and stderr before Head-and-Tail truncation is applied. Defaults to 8000.",
        ),
    }),
    execute: async ({ path, command, timeoutMs, outputMaxLength }) => {
      try {
        const result = await sandbox.commands.run(command, {
          cwd: path,
          timeoutMs: timeoutMs,
        });

        return {
          exitCode: result.exitCode,
          error: result.error,
          stdout: truncateOutput(result.stdout, outputMaxLength),
          stderr: truncateOutput(result.stderr, outputMaxLength),
        };
      } catch (error) {
        if (error instanceof CommandExitError) {
          return {
            exitCode: error.exitCode,
            error: error.error,
            stdout: truncateOutput(error.stdout, outputMaxLength),
            stderr: truncateOutput(error.stderr, outputMaxLength),
          };
        }

        throw error;
      }
    },
  });
};
