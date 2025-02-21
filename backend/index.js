import express from 'express';
import { Server } from 'socket.io';
import {createServer} from 'http'
import cors from "cors"
import analyticsRouter from './src/routes/analytics.js';
import analyticsModel from './src/models/analytics.js';
import { mongoConnect } from './src/config/db.js';



const PORT = process.env.PORT || 3000;

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


io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('disconnect', () => {
    console.log(socket.id, ' disconnected');
  });
});


const eventChangeStream = analyticsModel.watch();

let eventCountLast5Minutes = 0;
let eventCountHistory = [];
let eventTypeCounts = {};
let totalEventCount = 0
let peakEventsPerMinute = 0;
let userEventCounts = {};
let activeUsers = new Set();

const ROLLING_WINDOW = 1; // per min rolling avg

eventChangeStream.on('change', (change) => {
  if (change.operationType === 'insert') {
      const eventType = change.fullDocument.eventType;
      const userId = change.fullDocument.userId;
      const eventTimestamp = change.fullDocument.timestamp;

      // Update counts
      totalEventCount++;
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
      activeUsers.add(userId);
      userEventCounts[userId] = (userEventCounts[userId] || 0) + 1;

      // Rolling window calculations
      const xMinutesAgo = new Date(Date.now() - ROLLING_WINDOW * 60 * 1000);
      eventCountHistory.push(eventTimestamp);
      eventCountHistory = eventCountHistory.filter(timestamp => timestamp > xMinutesAgo);
      const rollingAverage = eventCountHistory.length / ROLLING_WINDOW;
      peakEventsPerMinute = Math.max(peakEventsPerMinute, rollingAverage);

      // Sort top users
      const topUsers = Object.entries(userEventCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

      io.emit('realTimeAggregations', {
          totalEventCount,
          eventCountLast5Minutes,
          rollingAverage,
          peakEventsPerMinute,
          eventTypeCounts,
          activeUsersCount: activeUsers.size,
          topUsers
      });
  }
});




httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  mongoConnect()
});
