"use client";

import { triggerTestRun, updateAgentStatus } from "@/lib/actions";
import { useParams } from "next/navigation";
import { useTransition } from "react";

const TriggerTestRunButton = () => {
  const { agentId } = useParams();

  const [isPending, startTransition] = useTransition();

  const handleTriggerTestRun = () => {
    startTransition(async () => {
      await updateAgentStatus(String(agentId), "executing");
      await triggerTestRun(String(agentId));
    });
  };

  return (
    <button
      onClick={handleTriggerTestRun}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {isPending && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {isPending ? "Executing Run..." : "Trigger Test Run"}
    </button>
  );
};

export default TriggerTestRunButton;
