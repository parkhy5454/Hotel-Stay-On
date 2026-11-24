import { randomBytes } from "node:crypto";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { bookingsTable, db, roomsTable, staysTable } from "@workspace/db";
import {
  CreateBookingBody,
  CreateBookingResponse,
  GetBookingParams,
  GetBookingResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (Date.parse(`${checkOut}T00:00:00Z`) -
      Date.parse(`${checkIn}T00:00:00Z`)) /
      86_400_000,
  );
}

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const checkIn = data.checkIn.toISOString().slice(0, 10);
  const checkOut = data.checkOut.toISOString().slice(0, 10);
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0 || nights > 60) {
    res.status(400).json({ error: "Check-out must be after check-in and within 60 nights" });
    return;
  }

  const [room] = await db
    .select()
    .from(roomsTable)
    .where(and(eq(roomsTable.id, data.roomId), eq(roomsTable.active, true)));
  if (!room || data.guests > room.capacity) {
    res.status(400).json({ error: "The selected room is not available for this party size" });
    return;
  }

  const [stay] = await db
    .select()
    .from(staysTable)
    .where(and(eq(staysTable.id, room.stayId), eq(staysTable.active, true)));
  if (!stay) {
    res.status(400).json({ error: "The selected stay is not accepting reservations" });
    return;
  }

  const overlapping = await db
    .select({
      checkIn: bookingsTable.checkIn,
      checkOut: bookingsTable.checkOut,
    })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.roomId, room.id),
        lt(bookingsTable.checkIn, checkOut),
        gt(bookingsTable.checkOut, checkIn),
        ne(bookingsTable.status, "cancelled"),
      ),
    );

  for (
    let night = Date.parse(`${checkIn}T00:00:00Z`);
    night < Date.parse(`${checkOut}T00:00:00Z`);
    night += 86_400_000
  ) {
    const day = new Date(night).toISOString().slice(0, 10);
    const nextDay = new Date(night + 86_400_000).toISOString().slice(0, 10);
    const occupied = overlapping.filter(
      (booking) => booking.checkIn < nextDay && booking.checkOut > day,
    ).length;
    if (occupied >= room.inventory) {
      res.status(400).json({ error: "There are no rooms available for those dates" });
      return;
    }
  }

  const code = randomBytes(6).toString("hex").toUpperCase();
  const [booking] = await db
    .insert(bookingsTable)
    .values({
      code,
      roomId: room.id,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      checkIn,
      checkOut,
      guests: data.guests,
      totalPrice: room.pricePerNight * nights,
    })
    .returning();

  res.status(201).json(
    CreateBookingResponse.parse({
      code: booking.code,
      stayName: stay.name,
      roomName: room.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
    }),
  );
});

router.get("/bookings/:code", async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [record] = await db
    .select({
      booking: bookingsTable,
      stayName: staysTable.name,
      roomName: roomsTable.name,
    })
    .from(bookingsTable)
    .innerJoin(roomsTable, eq(bookingsTable.roomId, roomsTable.id))
    .innerJoin(staysTable, eq(roomsTable.stayId, staysTable.id))
    .where(eq(bookingsTable.code, params.data.code.toUpperCase()));

  if (!record) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.json(
    GetBookingResponse.parse({
      code: record.booking.code,
      stayName: record.stayName,
      roomName: record.roomName,
      checkIn: record.booking.checkIn,
      checkOut: record.booking.checkOut,
      guests: record.booking.guests,
      totalPrice: record.booking.totalPrice,
      status: record.booking.status,
    }),
  );
});

export default router;
