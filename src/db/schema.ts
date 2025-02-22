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
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  postId: integer()
    .notNull()
    .references(() => postsTable.id, { onDelete: 'cascade' }),
  approved: boolean().default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})