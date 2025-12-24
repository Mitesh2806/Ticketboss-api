import EventModel from "../models/event.model.js";
import ReservationModel from "../models/reservation.model.js";

const TARGET_EVENT_ID = "node-meetup-2025";

export async function createReservation(partnerId: string, seats: number) {
  // 1. Fetch current state
  const event = await EventModel.findOne({ eventId: TARGET_EVENT_ID });
  
  if (!event) {
    throw new Error("Event not found"); // Should not happen if seeded
  }

  // 2. Check availability locally first
  if (event.availableSeats < seats) {
    return { success: false, error: "Not enough seats left", status: 409 };
  }

  // 3. OPTIMISTIC CONCURRENCY UPDATE
  // We filter by BOTH eventId AND the version we just read.
  const updatedEvent = await EventModel.findOneAndUpdate(
    {
      eventId: TARGET_EVENT_ID,
      version: event.version, // <--- The Guard
    },
    {
      $inc: { availableSeats: -seats, version: 1 },
    },
    { new: true }
  );

  // 4. If null, the version changed before we could write (Race Condition)
  if (!updatedEvent) {
    return { success: false, error: "Concurrency conflict. Please retry.", status: 409 };
  }

  // 5. Create the reservation record
  const reservation = await ReservationModel.create({
    eventId: TARGET_EVENT_ID,
    partnerId,
    seats,
    status: "confirmed",
  });

  return { success: true, data: reservation, status: 201 };
}

export async function cancelReservation(reservationId: string) {
  const reservation = await ReservationModel.findOne({ reservationId });

  if (!reservation) return { success: false, status: 404 };

  // Restore seats to pool
  await EventModel.findOneAndUpdate(
    { eventId: reservation.eventId },
    { $inc: { availableSeats: reservation.seats, version: 1 } }
  );

  await ReservationModel.deleteOne({ reservationId });

  return { success: true, status: 204 };
}

export async function getEventSummary() {
  const event = await EventModel.findOne({ eventId: TARGET_EVENT_ID });
  if (!event) return null;

  const reservationCount = await ReservationModel.countDocuments({
    eventId: TARGET_EVENT_ID,
  });

  return {
    eventId: event.eventId,
    name: event.name,
    totalSeats: event.totalSeats,
    availableSeats: event.availableSeats,
    reservationCount,
    version: event.version,
  };
}