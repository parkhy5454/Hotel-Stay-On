import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { staysTable } from "./stays";

export const roomsTable = pgTable("rooms", {
  id: serial("id").primaryKey(),
  stayId: integer("stay_id")
    .notNull()
    .references(() => staysTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  pricePerNight: integer("price_per_night").notNull(),
  capacity: integer("capacity").notNull(),
  inventory: integer("inventory").notNull(),
  amenities: text("amenities").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
});

export type Room = typeof roomsTable.$inferSelect;
