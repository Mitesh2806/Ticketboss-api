import mongoose from "mongoose";

export interface EventDocument extends mongoose.Document {
  eventId: string;
  name: string;
  totalSeats: number;
  availableSeats: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    version: { type: Number, default: 0 }, 
  },
  {
    timestamps: true,
  }
);

const EventModel = mongoose.model<EventDocument>("Event", eventSchema);
export default EventModel;