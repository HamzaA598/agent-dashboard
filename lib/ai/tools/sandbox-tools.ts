import Sandbox from "@e2b/code-interpreter";
import { createReadSandboxedFileTool } from "./read-sandboxed-file";
import { createListSandboxedFileTool } from "./list-sandboxed-files";
import { createWriteSandboxedFileTool } from "./write-sandboxed-file";
import { createExecuteSandboxedCommandTool } from "./execute-sandboxed-command";
import { createPatchSandboxedFileTool } from "./patch-sandboxed-file";

export const createSandboxTools = (sandbox: Sandbox) => ({
  readSandboxedFile: createReadSandboxedFileTool(sandbox),
  listSandboxedFile: createListSandboxedFileTool(sandbox),
  writeSandboxedFile: createWriteSandboxedFileTool(sandbox),
  executeSandboxedCommand: createExecuteSandboxedCommandTool(sandbox),
  patchSandboxedFile: createPatchSandboxedFileTool(sandbox),
});
