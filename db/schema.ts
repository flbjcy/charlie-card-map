import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const reports = sqliteTable('reports', {
 id: text('id').primaryKey(), station: text('station').notNull(), design: text('design').notNull(),
 exitId: text('exit_id'), machine: text('machine').notNull(), color: text('color').notNull(), status: text('status').notNull(),
 observedAt: integer('observed_at').notNull(), createdAt: integer('created_at').notNull(),
 notes: text('notes').notNull(), source: text('source').notNull(), sourceUrl: text('source_url'), clientHash: text('client_hash'), photoKey: text('photo_key'),
});
export const syncState = sqliteTable('sync_state', {id:text('id').primaryKey(), attemptedAt:integer('attempted_at').notNull(), succeededAt:integer('succeeded_at'), message:text('message').notNull()});

export const traffic = sqliteTable('traffic', {id:text('id').primaryKey(),day:text('day').notNull(),createdAt:integer('created_at').notNull(),source:text('source').notNull(),device:text('device').notNull(),visit:integer('visit').notNull()});
