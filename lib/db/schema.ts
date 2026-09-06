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

export const statusEnum = pgEnum("status", ["active", "idle", "executing"]);

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

  status: statusEnum("status").notNull(),

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
