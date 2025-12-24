import * as z from "zod";

export const createReservationSchema = z.object({
  body: z.object({
    partnerId: z.string().min(1, "Partner ID is required"),
    
    seats: z.number()
      .int()
      .min(1, "Must reserve at least 1 seat")
      .max(10, "Cannot reserve more than 10 seats"),
  }),
});

export type CreateReservationInput = z.TypeOf<typeof createReservationSchema>;