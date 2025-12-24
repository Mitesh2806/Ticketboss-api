# TicketBoss - Event Ticketing API

TicketBoss is a lightweight, high-performance RESTful API designed to handle real-time event seat reservations. It features optimistic concurrency control to prevent over-selling in high-traffic scenarios.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Technical Decisions](#technical-decisions)
  - [Handling Concurrent Bookings](#handling-concurrent-bookings-optimistic-concurrency)
  - [Async/Await vs. Worker Threads](#why-asyncawait-instead-of-worker-threads)
- [Project Structure](#project-structure)

## 🚀 Project Overview
This API allows external partners to:
1.  **Initialize** an event with a fixed number of seats.
2.  **Reserve** seats in real-time with instant feedback.
3.  **Cancel** reservations and release seats back to the pool.
4.  **View** the current status of the event (available seats, total reservations).

## 🛠 Tech Stack
-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Language:** TypeScript
-   **Database:** MongoDB (via Mongoose)
-   **Validation:** Zod
-   **Documentation:** Swagger / OpenAPI

## ⚙️ Setup Instructions

### Prerequisites
-   Node.js (v18+ recommended)
-   MongoDB (Local instance or Atlas connection string)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd ticketboss
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/ticketboss
    ```

### Running the Application
-   **Development Mode** (with hot-reload):
    ```bash
    npm run dev
    ```
-   **Production Build:**
    ```bash
    npm run build
    npm start
    ```

## zb API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
**`http://localhost:3000/docs`**

### Core Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/reservations` | Reserve 1-10 seats. Returns `201` on success or `409` on conflict. |
| **DELETE** | `/reservations/:id` | Cancel a reservation and release seats. |
| **GET** | `/reservations` | Get event summary (total, reserved, and available seats). |
| **GET** | `/healthcheck` | Check if the API is running. |

## 🧠 Technical Decisions

### Handling Concurrent Bookings (Optimistic Concurrency)
**The Challenge:**
In a high-load scenario, multiple users might try to book the last available seats simultaneously. A standard "read-modify-write" approach creates a race condition where multiple requests read the same "available seat count" and overwrite each other, leading to over-selling (negative inventory).

**The Solution:**
I implemented **Optimistic Concurrency Control (OCC)** using a versioning strategy.
1.  **Versioning:** The Event model includes a `version` field.
2.  **Atomic Updates:** When processing a reservation, the code does not simply set the new seat count. Instead, it attempts an atomic update that depends on the version read at the start of the request:
    ```typescript
    // Pseudo-code representation
    await EventModel.findOneAndUpdate(
      { 
        eventId: "node-meetup-2025", 
        version: currentVersion // The Guard Clause
      },
      { 
        $inc: { availableSeats: -seats, version: 1 } // Atomic Decrement & Version Bump
      }
    );
    ```
3.  **Conflict Resolution:** If another request modified the database in the split second between our read and write, the `version` will not match, and the update operation returns `null`. The API catches this and returns a `409 Conflict` error, ensuring data consistency without the performance penalty of database-level locking.

### Why Async/Await instead of Worker Threads?
**Decision:**
I chose to use the standard Node.js **Event Loop architecture with `async/await`** rather than offloading requests to **Worker Threads**.

**Reasoning:**
1.  **I/O Bound Workload:** The operations in this API (Database Reads/Writes, Network Requests) are **I/O bound**, not CPU bound.
2.  **Node.js Architecture:** Node.js is designed specifically for this use case. It uses a single thread to orchestrate operations but offloads the actual I/O (like waiting for MongoDB to respond) to the system kernel (via libuv). `async/await` is the mechanism that allows the main thread to handle thousands of other concurrent requests while waiting for the database response.
3.  **Worker Thread Overhead:** Worker threads are useful for CPU-intensive tasks (e.g., video compression, complex math) that would block the main thread. Using them for simple database queries would introduce unnecessary memory overhead and context-switching costs without improving performance. The Event Loop is the most efficient pattern for high-throughput I/O APIs like TicketBoss.

## 📁 Project Structure

src/
├── controllers/        # Request handlers: extract input, call services, return responses
├── lib/                # Shared utilities (DB connection, logger, cron jobs)
├── middleware/         # Request validation and middleware (Zod, auth, etc.)
├── models/             # Mongoose data models (Event, Reservation)
├── schema/             # Zod validation schemas
├── service/            # Core business logic (includes concurrency handling)
├── utils/              # Helper utilities (seeding, Swagger config)
└── index.ts            # Application entry point and route definitions
