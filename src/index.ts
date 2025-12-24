import express from "express";
import type { Request, Response } from "express";

import connectDB from "./lib/db.js";
import logger from "./lib/logger.js";
import { seedDatabase } from "./utils/seed.js";
import { createReservationSchema } from "./schema/reservation.schema.js";
import validateResource from "./middleware/validateResource.js";
import swaggerUi from "swagger-ui-express"; // Import this
import swaggerSpec from "./utils/swagger.js";
import {
  createReservationHandler,
  cancelReservationHandler,
  getSummaryHandler,
} from "./controllers/reservation.controller.js";
import job from "./lib/cron.js";
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

// ==========================================
// ROUTES
// ==========================================

// Healthcheck
app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// 1. Reserve Seats
/**
 * @openapi
 * /reservations:
 *   post:
 *     tags:
 *       - Reservations
 *     summary: Reserve seats for the event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationInput'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Bad Request (Validation Error)
 *       409:
 *         description: Conflict (Not enough seats)
 */
app.post(
  "/reservations",
  validateResource(createReservationSchema),
  createReservationHandler
);

// 2. Cancel Reservation
/**
 * @openapi
 * /reservations/{reservationId}:
 *   delete:
 *     tags:
 *       - Reservations
 *     summary: Cancel a reservation
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The reservation ID to cancel
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       404:
 *         description: Reservation not found
 */
app.delete("/reservations/:reservationId", cancelReservationHandler);

// 3. Event Summary
/**
 * @openapi
 * /reservations:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Get event summary with all reservations
 *     responses:
 *       200:
 *         description: Successfully retrieved event summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSeats:
 *                   type: integer
 *                   example: 100
 *                 availableSeats:
 *                   type: integer
 *                   example: 85
 *                 reservedSeats:
 *                   type: integer
 *                   example: 15
 *                 reservations:
 *                   type: array
 *                   items:
 *                     type: object
 */
app.get("/reservations", getSummaryHandler);
job.start();

app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);

  await connectDB();
  await seedDatabase();
});