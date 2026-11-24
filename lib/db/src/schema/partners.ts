import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const partnersTable = pgTable(
  "partners",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    businessName: text("business_name").notNull(),
    ownerName: text("owner_name").notNull(),
    phone: text("phone").notNull(),
    businessNumber: text("business_number").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("partners_clerk_user_id_unique").on(table.clerkUserId)],
);

export type Partner = typeof partnersTable.$inferSelect;
