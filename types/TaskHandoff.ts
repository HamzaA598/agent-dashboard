export interface TaskHandoff {
  id: string;

  fromExecutionId: string;
  toExecutionId: string;

  checkpointSummary: string;
  completedTasks: string[];
  pendingTasks: string[];
  artifacts?: Record<string, any>;

  status: string;

  createdAt: string;
}

export interface TaskHandoffContext {
  checkpointSummary: string;
  completedTasks: string[];
  pendingTasks: string[];
  artifacts?: Record<string, any> | null;
}
