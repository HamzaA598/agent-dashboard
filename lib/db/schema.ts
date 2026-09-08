import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const threadStatusEnum = pgEnum("thread_status", [
  "active",
  "idle",
  "executing",
]);
export const agentExecutionStatusEnum = pgEnum("agent_execution_status", [
  "pending",
  "executing",
  "completed",
  "failed",
]);
export const taskHandoffStatusEnum = pgEnum("task_handoff_status", [
  "pending",
  "consumed",
  "failed",
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  slug: varchar("slug", { length: 256 }).unique().notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const promptTemplates = pgTable("prompt_templates", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title").notNull(),

  templateBody: text("template_body"),
});

export const threads = pgTable("threads", {
  id: uuid("id").defaultRandom().primaryKey(),

  // workspaceId: uuid("workspace_id")
  //   .notNull()
  //   .references(() => workspaces.id, { onDelete: "cascade" }),

  title: text("title").notNull(),

  activeAgentId: varchar("active_agent_id", { length: 256 }).notNull(),

  status: threadStatusEnum("status").notNull(),

  totalTokens: integer("total_tokens").default(0).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  threadId: uuid("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),

  role: varchar("role", { length: 256 }).notNull(),

  metadata: jsonb("metadata"),

  content: text("content").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const agentExecutions = pgTable("agent_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentExecutionId: uuid("parent_execution_id").references(
    (): any => agentExecutions.id,
    {
      onDelete: "cascade",
    },
  ),
  agentId: varchar("agent_id", { length: 256 }).notNull(),
  triggerRunId: varchar("trigger_run_id", { length: 256 }),
  status: agentExecutionStatusEnum("status").default("pending").notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  durationMs: integer("duration_ms"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const taskHandoffs = pgTable("task_handoffs", {
  id: uuid("id").defaultRandom().primaryKey(),

  fromExecutionId: uuid("from_execution_id")
    .references(() => agentExecutions.id, { onDelete: "cascade" })
    .notNull(),
  toExecutionId: uuid("to_execution_id").references(() => agentExecutions.id, {
    onDelete: "set null",
  }),

  completedTasks: jsonb("completed_tasks"),
  pendingTasks: jsonb("pending_tasks"),
  checkpointSummary: text("checkpoint_summary"),
  artifacts: jsonb("artifacts"),
  status: taskHandoffStatusEnum("status").default("pending").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
