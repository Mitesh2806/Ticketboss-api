import EventModel from "../models/event.model.js";
import log from "../lib/logger.js"; // Assuming you have the logger from the uploaded file

export async function seedDatabase() {
  const eventId = "node-meetup-2025";
  try {
    const exists = await EventModel.findOne({ eventId });
    if (!exists) {
      await EventModel.create({
        eventId,
        name: "Node.js Meet-up",
        totalSeats: 500,
        availableSeats: 500,
        version: 0,
      });
      log.info("Seed Data: Event 'node-meetup-2025' initialized.");
    }
  } catch (e: Error | any) {
    log.error("Error seeding database", e);
  }
}