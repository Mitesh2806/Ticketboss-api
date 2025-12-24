import type{ Request, Response } from "express";
import type{ CreateReservationInput } from "../schema/reservation.schema.js";
import {
  createReservation,
  cancelReservation,
  getEventSummary,
} from "../service/reservation.service.js";

export async function createReservationHandler(
  req: Request<{}, {}, CreateReservationInput["body"]>,
  res: Response
) {
  try {
    const { partnerId, seats } = req.body;
    const result = await createReservation(partnerId, seats);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(201).json({
      reservationId: result.data?.reservationId,
      seats: result.data?.seats,
      status: result.data?.status,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function cancelReservationHandler(req: Request, res: Response) {
  const { reservationId } = req.params as { reservationId: string };
  const result = await cancelReservation(reservationId);

  if (!result.success) {
    return res.status(404).json({ error: "Reservation not found or already cancelled" });
  }

  return res.sendStatus(204);
}

export async function getSummaryHandler(req: Request, res: Response) {
  const summary = await getEventSummary();
  if (!summary) return res.sendStatus(404);
  return res.json(summary);
}