import { TaskHandoffContext } from "@/types/TaskHandoff";

interface FormatTaskPromptParams {
  prompt: string;
  handoff?: TaskHandoffContext;
  input?: Record<string, any>;
}

/**
 * Pure presentation helper that compiles an agent execution brief.
 * Formats prior handoff checkpoints into GitHub-flavored markdown checklists (- [x] / - [ ])
 * and appends structured task input and active mission objectives.
 */
export function formatTaskPrompt({
  prompt,
  handoff,
  input,
}: FormatTaskPromptParams): string {
  const sections: string[] = [];

  if (handoff) {
    const handoffLines: string[] = [
      "## Prior Execution Context & Progress",
      `**Summary of Previous Work:**\n${handoff.checkpointSummary}`,
    ];

    if (handoff.completedTasks && handoff.completedTasks.length > 0) {
      handoffLines.push(
        "### Completed Tasks",
        handoff.completedTasks.map((task) => `- [x] ${task}`).join("\n"),
      );
    }

    if (handoff.pendingTasks && handoff.pendingTasks.length > 0) {
      handoffLines.push(
        "### Pending Tasks to Continue",
        handoff.pendingTasks.map((task) => `- [ ] ${task}`).join("\n"),
      );
    }

    if (handoff.artifacts && Object.keys(handoff.artifacts).length > 0) {
      handoffLines.push(
        "### Available Artifacts",
        "```json",
        JSON.stringify(handoff.artifacts, null, 2),
        "```",
      );
    }

    sections.push(handoffLines.join("\n\n"));
  }

  if (input && Object.keys(input).length > 0) {
    sections.push(
      [
        "## Structured Input Parameters",
        "```json",
        JSON.stringify(input, null, 2),
        "```",
      ].join("\n"),
    );
  }

  sections.push(`## Active Mission Objective\n${prompt}`);

  return sections.join("\n\n---\n\n");
}
