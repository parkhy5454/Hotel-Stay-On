import {
  and,
  asc,
  eq,
  inArray,
} from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  bookingsTable,
  db,
  partnersTable,
  roomsTable,
  staysTable,
} from "@workspace/db";
import {
  CreatePartnerRoomBody,
  CreatePartnerRoomParams,
  CreatePartnerRoomResponse,
  CreatePartnerStayBody,
  CreatePartnerStayResponse,
  GetPartnerProfileResponse,
  ListPartnerBookingsResponse,
  ListPartnerStaysResponse,
  RegisterPartnerBody,
  RegisterPartnerResponse,
  UpdatePartnerBookingBody,
  UpdatePartnerBookingParams,
  UpdatePartnerBookingResponse,
  UpdatePartnerRoomBody,
  UpdatePartnerRoomParams,
  UpdatePartnerRoomResponse,
  UpdatePartnerStayBody,
  UpdatePartnerStayParams,
  UpdatePartnerStayResponse,
} from "@workspace/api-zod";
import { getClerkUserId, requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use("/partner", requireAuth);

async function findPartner(clerkUserId: string) {
  const [partner] = await db
    .select()
    .from(partnersTable)
    .where(eq(partnersTable.clerkUserId, clerkUserId));
  return partner;
}

async function getPartnerStays(partnerId: number) {
  const stays = await db
    .select()
    .from(staysTable)
    .where(eq(staysTable.partnerId, partnerId));
  if (stays.length === 0) return [];

  const rooms = await db
    .select()
    .from(roomsTable)
    .where(inArray(roomsTable.stayId, stays.map((stay) => stay.id)));

  return stays.map((stay) => ({
    id: stay.id,
    name: stay.name,
    city: stay.city,
    address: stay.address,
    category: stay.category,
    description: stay.description,
    imageUrl: stay.imageUrl,
    rating: stay.rating,
    reviewCount: stay.reviewCount,
    active: stay.active,
    rooms: rooms
      .filter((room) => room.stayId === stay.id)
      .map((room) => ({
        id: room.id,
        name: room.name,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        inventory: room.inventory,
        amenities: room.amenities,
      })),
  }));
}

router.post("/partner/register", async (req, res): Promise<void> => {
  const parsed = RegisterPartnerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const clerkUserId = getClerkUserId(req);
  const existing = await findPartner(clerkUserId);
  if (existing) {
    res.status(409).json({ error: "A partner profile already exists" });
    return;
  }

  const [partner] = await db
    .insert(partnersTable)
    .values({
      clerkUserId,
      businessName: parsed.data.businessName,
      ownerName: parsed.data.ownerName,
      phone: parsed.data.phone,
      businessNumber: parsed.data.businessNumber ?? "",
    })
    .returning();

  res.status(201).json(RegisterPartnerResponse.parse(partner));
});

router.get("/partner/me", async (req, res): Promise<void> => {
  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(404).json({ error: "Partner registration required" });
    return;
  }

  res.json(GetPartnerProfileResponse.parse(partner));
});

router.get("/partner/stays", async (req, res): Promise<void> => {
  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(403).json({ error: "Partner registration required" });
    return;
  }

  res.json(ListPartnerStaysResponse.parse(await getPartnerStays(partner.id)));
});

router.post("/partner/stays", async (req, res): Promise<void> => {
  const parsed = CreatePartnerStayBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(403).json({ error: "Partner registration required" });
    return;
  }

  const data = parsed.data;
  const created = await db.transaction(async (tx) => {
    const [stay] = await tx
      .insert(staysTable)
      .values({
        partnerId: partner.id,
        name: data.name,
        city: data.city,
        address: data.address,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
      })
      .returning();
    const [room] = await tx
      .insert(roomsTable)
      .values({
        stayId: stay.id,
        name: data.roomName,
        pricePerNight: data.pricePerNight,
        capacity: data.capacity,
        inventory: data.inventory,
        amenities: data.amenities,
      })
      .returning();
    return { stay, room };
  });

  res.status(201).json(
    CreatePartnerStayResponse.parse({
      id: created.stay.id,
      name: created.stay.name,
      city: created.stay.city,
      address: created.stay.address,
      category: created.stay.category,
      description: created.stay.description,
      imageUrl: created.stay.imageUrl,
      rating: created.stay.rating,
      reviewCount: created.stay.reviewCount,
      active: created.stay.active,
      rooms: [
        {
          id: created.room.id,
          name: created.room.name,
          pricePerNight: created.room.pricePerNight,
          capacity: created.room.capacity,
          inventory: created.room.inventory,
          amenities: created.room.amenities,
        },
      ],
    }),
  );
});

router.patch("/partner/stays/:id", async (req, res): Promise<void> => {
  const params = UpdatePartnerStayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePartnerStayBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(403).json({ error: "Partner registration required" });
    return;
  }

  const [stay] = await db
    .select()
    .from(staysTable)
    .where(
      and(
        eq(staysTable.id, params.data.id),
        eq(staysTable.partnerId, partner.id),
      ),
    );
  if (!stay) {
    res.status(404).json({ error: "Stay not found" });
    return;
  }

  const {
    roomName,
    pricePerNight,
    capacity,
    inventory,
    amenities,
    ...stayUpdate
  } = parsed.data;
  if (Object.keys(stayUpdate).length > 0) {
    await db
      .update(staysTable)
      .set({ ...stayUpdate, updatedAt: new Date() })
      .where(eq(staysTable.id, stay.id));
  }

  if (
    roomName !== undefined ||
    pricePerNight !== undefined ||
    capacity !== undefined ||
    inventory !== undefined ||
    amenities !== undefined
  ) {
    const [primaryRoom] = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.stayId, stay.id))
      .orderBy(asc(roomsTable.id))
      .limit(1);
    if (primaryRoom) {
      await db
        .update(roomsTable)
        .set({
          ...(roomName !== undefined ? { name: roomName } : {}),
          ...(pricePerNight !== undefined ? { pricePerNight } : {}),
          ...(capacity !== undefined ? { capacity } : {}),
          ...(inventory !== undefined ? { inventory } : {}),
          ...(amenities !== undefined ? { amenities } : {}),
        })
        .where(eq(roomsTable.id, primaryRoom.id));
    }
  }

  const updated = (await getPartnerStays(partner.id)).find(
    (item) => item.id === stay.id,
  );
  res.json(UpdatePartnerStayResponse.parse(updated));
});

router.post("/partner/stays/:id/rooms", async (req, res): Promise<void> => {
  const params = CreatePartnerRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreatePartnerRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(403).json({ error: "Partner registration required" });
    return;
  }
  const [stay] = await db
    .select({ id: staysTable.id })
    .from(staysTable)
    .where(
      and(
        eq(staysTable.id, params.data.id),
        eq(staysTable.partnerId, partner.id),
      ),
    );
  if (!stay) {
    res.status(404).json({ error: "Stay not found" });
    return;
  }

  const [room] = await db
    .insert(roomsTable)
    .values({ stayId: stay.id, ...parsed.data })
    .returning();
  res.status(201).json(CreatePartnerRoomResponse.parse(room));
});

router.patch("/partner/rooms/:id", async (req, res): Promise<void> => {
  const params = UpdatePartnerRoomParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePartnerRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(403).json({ error: "Partner registration required" });
    return;
  }
  const [ownedRoom] = await db
    .select({ id: roomsTable.id })
    .from(roomsTable)
    .innerJoin(staysTable, eq(roomsTable.stayId, staysTable.id))
    .where(
      and(
        eq(roomsTable.id, params.data.id),
        eq(staysTable.partnerId, partner.id),
      ),
    );
  if (!ownedRoom) {
    res.status(404).json({ error: "Room type not found" });
    return;
  }

  const [room] = await db
    .update(roomsTable)
    .set(parsed.data)
    .where(eq(roomsTable.id, ownedRoom.id))
    .returning();
  res.json(UpdatePartnerRoomResponse.parse(room));
});

router.get("/partner/bookings", async (req, res): Promise<void> => {
  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(403).json({ error: "Partner registration required" });
    return;
  }

  const records = await db
    .select({
      booking: bookingsTable,
      stayName: staysTable.name,
      roomName: roomsTable.name,
    })
    .from(bookingsTable)
    .innerJoin(roomsTable, eq(bookingsTable.roomId, roomsTable.id))
    .innerJoin(staysTable, eq(roomsTable.stayId, staysTable.id))
    .where(eq(staysTable.partnerId, partner.id));

  res.json(
    ListPartnerBookingsResponse.parse(
      records.map(({ booking, stayName, roomName }) => ({
        id: booking.id,
        code: booking.code,
        stayName,
        roomName,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status,
      })),
    ),
  );
});

router.patch("/partner/bookings/:id", async (req, res): Promise<void> => {
  const params = UpdatePartnerBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePartnerBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const partner = await findPartner(getClerkUserId(req));
  if (!partner) {
    res.status(403).json({ error: "Partner registration required" });
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
    .where(
      and(
        eq(bookingsTable.id, params.data.id),
        eq(staysTable.partnerId, partner.id),
      ),
    );
  if (!record) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  const [booking] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, record.booking.id))
    .returning();
  res.json(
    UpdatePartnerBookingResponse.parse({
      id: booking.id,
      code: booking.code,
      stayName: record.stayName,
      roomName: record.roomName,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
    }),
  );
});

export default router;
