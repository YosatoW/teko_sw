import { boolean, integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: varchar({ length: 255 }).notNull(),
  sentiment: varchar({ length: 80 }),
  correction: varchar({ length: 255 }),
  userId: integer().notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
})

export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: varchar({ length: 255 }).notNull(),
  sentiment: varchar({ length: 80 }),
  correction: varchar({ length: 255 }),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  postId: integer().notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  approved: boolean().default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const likesTable = pgTable("likes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  postId: integer().references(() => postsTable.id, { onDelete: 'cascade' }),
  commentId: integer().references(() => commentsTable.id, { onDelete: 'cascade' }),
  value: integer().notNull().default(0), // Changed to store -1 for dislike, 1 for like
  createdAt: timestamp('created_at').defaultNow().notNull(),
})