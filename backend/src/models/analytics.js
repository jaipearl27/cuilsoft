import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Object },
});

const analyticsModel =  mongoose.model('Analytics', analyticsSchema, 'Analytics');

export default analyticsModel