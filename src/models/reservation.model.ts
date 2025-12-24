import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ReservationDocument extends mongoose.Document {
  reservationId: string;
  eventId: string;
  partnerId: string;
  seats: number;
  status: string;
  createdAt: Date;
}

const reservationSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    eventId: { type: String, required: true },
    partnerId: { type: String, required: true },
    seats: { type: Number, required: true },
    status: { type: String, default: "confirmed" },
  },
  {
    timestamps: true,
  }
);

const ReservationModel = mongoose.model<ReservationDocument>("Reservation", reservationSchema);
export default ReservationModel;