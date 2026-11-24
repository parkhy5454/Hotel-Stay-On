import { date, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { roomsTable } from "./rooms";

export const bookingsTable = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    roomId: integer("room_id")
      .notNull()
      .references(() => roomsTable.id, { onDelete: "restrict" }),
    guestName: text("guest_name").notNull(),
    guestEmail: text("guest_email").notNull(),
    guestPhone: text("guest_phone").notNull(),
    checkIn: date("check_in", { mode: "string" }).notNull(),
    checkOut: date("check_out", { mode: "string" }).notNull(),
    guests: integer("guests").notNull(),
    totalPrice: integer("total_price").notNull(),
    status: text("status").notNull().default("requested"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("bookings_code_unique").on(table.code)],
);

export type Booking = typeof bookingsTable.$inferSelect;
