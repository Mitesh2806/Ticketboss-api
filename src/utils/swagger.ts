import swaggerJsdoc from 'swagger-jsdoc';
import { createRequire } from 'module'; // Ensure you have resolveJsonModule: true in tsconfig


const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reservation API Docs',
      version: packageJson.version,
      description: 'API for managing seat reservations for the Node.js Meetup',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://ticketboss-api-6o7h.onrender.com',
        description: 'Production Server',
      }
    ],
    components: {
      schemas: {
        CreateReservationInput: {
          type: 'object',
          required: ['partnerId', 'seats'],
          properties: {
            partnerId: {
              type: 'string',
              description: 'Unique ID of the partner making the reservation',
              example: 'partner_123',
            },
            seats: {
              type: 'integer',
              description: 'Number of seats to reserve (1-10)',
              minimum: 1,
              maximum: 10,
              example: 2,
            },
          },
        },
      },
    },
  },
  // Look for swagger definitions in these files
  apis: ['./src/index.ts', './src/routes/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;