import express from 'express'
import { addEvent, getAnalytics } from '../controllers/analytics.js'

const analyticsRouter = express.Router()

analyticsRouter.route('/').get(getAnalytics).post(addEvent)

export default analyticsRouter