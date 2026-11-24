import { and, eq, gt, ilike, inArray, lt, ne } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  bookingsTable,
  db,
  roomsTable,
  staysTable,
} from "@workspace/db";
import {
  GetStayParams,
  GetStayResponse,
  ListStaysQueryParams,
  ListStaysResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

function hasAvailability(
  roomId: number,
  inventory: number,
  checkIn: string,
  checkOut: string,
  bookings: Array<{ roomId: number; checkIn: string; checkOut: string }>,
): boolean {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  for (let night = start; night < end; night += 86_400_000) {
    const day = new Date(night).toISOString().slice(0, 10);
    const nextDay = new Date(night + 86_400_000).toISOString().slice(0, 10);
    const occupied = bookings.filter(
      (booking) =>
        booking.roomId === roomId &&
        booking.checkIn < nextDay &&
        booking.checkOut > day,
    ).length;
    if (occupied >= inventory) return false;
  }
  return true;
}

router.get("/stays", async (req, res): Promise<void> => {
  const query = ListStaysQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const filters = query.data;
  const checkIn = filters.checkIn?.toISOString().slice(0, 10);
  const checkOut = filters.checkOut?.toISOString().slice(0, 10);
  if (
    Boolean(checkIn) !== Boolean(checkOut) ||
    (checkIn && checkOut && nightsBetween(checkIn, checkOut) <= 0)
  ) {
    res.status(400).json({ error: "A valid check-in and check-out range is required" });
    return;
  }

  const stays = await db
    .select()
    .from(staysTable)
    .where(
      and(
        eq(staysTable.active, true),
        filters.city ? ilike(staysTable.city, `%${filters.city}%`) : undefined,
        filters.category
          ? eq(staysTable.category, filters.category)
          : undefined,
      ),
    );
  const stayIds = stays.map((stay) => stay.id);
  if (stayIds.length === 0) {
    res.json(ListStaysResponse.parse([]));
    return;
  }

  const rooms = await db
    .select()
    .from(roomsTable)
    .where(and(inArray(roomsTable.stayId, stayIds), eq(roomsTable.active, true)));

  const matchingRoomIds = rooms
    .filter(
      (room) =>
        room.capacity >= filters.guests &&
        (filters.minPrice === undefined ||
          room.pricePerNight >= filters.minPrice) &&
        (filters.maxPrice === undefined ||
          room.pricePerNight <= filters.maxPrice),
    )
    .map((room) => room.id);
  const bookings =
    checkIn && checkOut && matchingRoomIds.length > 0
      ? await db
          .select({
            roomId: bookingsTable.roomId,
            checkIn: bookingsTable.checkIn,
            checkOut: bookingsTable.checkOut,
          })
          .from(bookingsTable)
          .where(
            and(
              inArray(bookingsTable.roomId, matchingRoomIds),
              lt(bookingsTable.checkIn, checkOut),
              gt(bookingsTable.checkOut, checkIn),
              ne(bookingsTable.status, "cancelled"),
            ),
          )
      : [];

  const result = stays
    .map((stay) => {
      const matchingRooms = rooms.filter(
        (room) =>
          room.stayId === stay.id &&
          room.capacity >= filters.guests &&
          (filters.minPrice === undefined ||
            room.pricePerNight >= filters.minPrice) &&
          (filters.maxPrice === undefined ||
            room.pricePerNight <= filters.maxPrice) &&
          (!checkIn ||
            !checkOut ||
            hasAvailability(
              room.id,
              room.inventory,
              checkIn,
              checkOut,
              bookings,
            )),
      );
      return matchingRooms.length
        ? {
            id: stay.id,
            name: stay.name,
            city: stay.city,
            address: stay.address,
            category: stay.category,
            description: stay.description,
            imageUrl: stay.imageUrl,
            rating: stay.rating,
            reviewCount: stay.reviewCount,
            rooms: matchingRooms.map((room) => ({
              id: room.id,
              name: room.name,
              pricePerNight: room.pricePerNight,
              capacity: room.capacity,
              inventory: room.inventory,
              amenities: room.amenities,
            })),
          }
        : null;
    })
    .filter((stay) => stay !== null);

  res.json(ListStaysResponse.parse(result));
});

router.get("/stays/:id", async (req, res): Promise<void> => {
  const params = GetStayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [stay] = await db
    .select()
    .from(staysTable)
    .where(and(eq(staysTable.id, params.data.id), eq(staysTable.active, true)));
  if (!stay) {
    res.status(404).json({ error: "Stay not found" });
    return;
  }

  const rooms = await db
    .select()
    .from(roomsTable)
    .where(and(eq(roomsTable.stayId, stay.id), eq(roomsTable.active, true)));

  res.json(
    GetStayResponse.parse({
      id: stay.id,
      name: stay.name,
      city: stay.city,
      address: stay.address,
      category: stay.category,
      description: stay.description,
      imageUrl: stay.imageUrl,
      rating: stay.rating,
      reviewCount: stay.reviewCount,
      checkInTime: stay.checkInTime,
      checkOutTime: stay.checkOutTime,
      ownerName: "스테이온 파트너",
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        inventory: room.inventory,
        amenities: room.amenities,
      })),
    }),
  );
});

export default router;
