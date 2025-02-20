import express from 'express';
import { Server } from 'socket.io';
import {createServer} from 'http'
import cors from "cors"
import analyticsRouter from './src/routes/analytics.js';
import analyticsModel from './src/models/analytics.js';
import { mongoConnect } from './src/config/db.js';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });


app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    // allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    // exposedHeaders: ["*", "Authorization"],
  })
);


//routes
app.use('/api/analytics',analyticsRouter);

// Socket.io connection setup
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


const eventChangeStream = analyticsModel.watch();

let eventCountLast5Minutes = 0;
let eventCountHistory = [];
const ROLLING_WINDOW = 30; // 30 min rolling avg

// MongoDB Change Stream to count events in the last 5 minutes
eventChangeStream.on('change', (change) => {
  const eventTimestamp = change.fullDocument.timestamp;

  // Update the event count for the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (eventTimestamp >= fiveMinutesAgo) {
    eventCountLast5Minutes++;
  }

  // Update rolling average window
  eventCountHistory.push(eventTimestamp);
  // Remove events older than the 30-minute window
  const thirtyMinutesAgo = new Date(Date.now() - ROLLING_WINDOW * 60 * 1000);
  eventCountHistory = eventCountHistory.filter(timestamp => timestamp > thirtyMinutesAgo);

  // Calculate rolling average
  const rollingAverage = eventCountHistory.length / ROLLING_WINDOW;

  // Emit the updated aggregation data to clients
  io.emit('realTimeAggregations', {
    eventCountLast5Minutes,
    rollingAverage
  });
});




// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mongoConnect()
});
