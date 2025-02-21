import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http'
import cors from "cors"
import analyticsRouter from './src/routes/analytics.js';
import analyticsModel from './src/models/analytics.js';
import { mongoConnect } from './src/config/db.js';

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  }
});

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  })
);

// Routes
app.use('/api/analytics', analyticsRouter);

const eventChangeStream = analyticsModel.watch();

let totalEventCount = 0;
let eventCountLast5Minutes = 0;
let rollingAverage = 0;
let peakEventsPerMinute = 0;
let eventTypeCounts = {};
let userEventCounts = {};
let activeUsers = new Set();
let eventCountHistory = [];
let topUsers = [];

const ROLLING_WINDOW = 1; // Rolling window in minutes


const calculateAnalytics = (events) => {
  totalEventCount = events.length;
  eventTypeCounts = {};
  userEventCounts = {};
  activeUsers.clear();
  eventCountLast5Minutes = 0;
  eventCountHistory = [];

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const xMinutesAgo = new Date(Date.now() - ROLLING_WINDOW * 60 * 1000);
  

  console.log(events)

  events.forEach(({ eventType, userId, timestamp }) => {
    if (!eventType || !userId) return;  // Ignore bad data

    eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
    userEventCounts[userId] = (userEventCounts[userId] || 0) + 1;
    activeUsers.add(userId);

    if (timestamp >= fiveMinutesAgo) {
      eventCountLast5Minutes++;
    }

    if (timestamp >= xMinutesAgo) {
      eventCountHistory.push({ eventType, userId, timestamp });
    }
  });

  rollingAverage = eventCountHistory.length / ROLLING_WINDOW;
  peakEventsPerMinute = Math.max(peakEventsPerMinute, rollingAverage);

  topUsers = Object.entries(userEventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, eventCount]) => ({ userId, eventCount }));

  // Emit updated data
  io.emit('realTimeAggregations', {
    totalEventCount,
    eventCountLast5Minutes,
    rollingAverage,
    peakEventsPerMinute,
    eventTypeCounts,
    activeUsersCount: activeUsers.size,
    topUsers
  });
};


// Initialize analytics on server start
const initializeAnalytics = async () => {
  console.log("Initializing analytics from database...");

  try {
    const events = await analyticsModel.find({}, { eventType: 1, userId: 1, timestamp: 1 });
    calculateAnalytics(events);
    console.log("Analytics initialized successfully.");
  } catch (error) {
    console.error("Error initializing analytics:", error);
  }
};

// Listen for real-time changes using MongoDB Change Streams
eventChangeStream.on('change', async (change) => {
  if (change.operationType === 'insert') {
    try {
      const event = await analyticsModel.find({}, { eventType: 1, userId: 1, timestamp: 1 });
      if (event) {
        // Remove old events from the rolling window
        const xMinutesAgo = new Date(Date.now() - ROLLING_WINDOW * 60 * 1000);
        eventCountHistory = eventCountHistory.filter(e => e >= xMinutesAgo);

        // Add new event to rolling history
        eventCountHistory.push(event.timestamp);

        // Recalculate metrics
        calculateAnalytics(event);
      }
    } catch (error) {
      console.error("Error processing change stream event:", error);
    }
  }
});


// WebSocket connection
io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  // Send current real-time metrics to new users
  socket.emit('realTimeAggregations', {
    totalEventCount,
    eventCountLast5Minutes,
    rollingAverage,
    peakEventsPerMinute,
    eventTypeCounts,
    activeUsersCount: activeUsers.size,
    topUsers
  });

  socket.on('disconnect', () => {
    console.log(socket.id, ' disconnected');
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mongoConnect();
  initializeAnalytics();
});
