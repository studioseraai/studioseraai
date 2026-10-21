import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:integer('id').primaryKey({autoIncrement:true}),kind:text('kind').notNull(),data:text('data').notNull(),created:text('created').notNull()});
export const media=sqliteTable('media',{id:text('id').primaryKey(),artworkId:integer('artwork_id').notNull().references(()=>records.id),name:text('name').notNull(),mime:text('mime').notNull(),category:text('category').notNull(),hash:text('hash').notNull(),size:integer('size').notNull(),created:text('created').notNull()});
