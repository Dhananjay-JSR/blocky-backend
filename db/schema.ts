import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const TransactionQueries = sqliteTable('transaction_querries',{
    id: integer('id').primaryKey({
        autoIncrement: true
    }),
    transaction_id : text('transaction_id'),
    json_data: text('json_data',{
        mode: "json"
    }),
})

export type Trsansactions = typeof TransactionQueries.$inferSelect // return type when queried
export type InsertTransaction = typeof TransactionQueries.$inferInsert // insert type




