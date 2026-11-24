import { boolean, integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { partnersTable } from "./partners";

export const staysTable = pgTable("stays", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partnersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  checkInTime: text("check_in_time").notNull().default("15:00"),
  checkOutTime: text("check_out_time").notNull().default("11:00"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Stay = typeof staysTable.$inferSelect;
