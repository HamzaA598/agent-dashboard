"use client";

import { updateAgentStatus } from "@/lib/agents-db";
import { useParams } from "next/navigation";

const TriggerTestRunButton = () => {
  const { agentId } = useParams();

  const handleTriggerTestRun = async () => {
    await updateAgentStatus(String(agentId), "executing");
  };

  return (
    <button onClick={handleTriggerTestRun}>trigger test run button</button>
  );
};

export default TriggerTestRunButton;
