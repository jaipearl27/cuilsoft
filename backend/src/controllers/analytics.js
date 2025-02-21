import analyticsModel from "../models/analytics.js";

export const getAnalytics = async (req, res) => {
    const { page = 1, limit = 10, eventType, userId, startDate, endDate, aggregateBy } = req.query;

    const query = {};

    // Filters
    if (eventType) query.eventType = eventType;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
        const filterDate = {};
        if (startDate) filterDate.$gte = new Date(startDate);
        if (endDate) filterDate.$lte = new Date(endDate);
        query.timestamp = filterDate;
    }

    const skip = (page - 1) * limit;
    const limitNumber = parseInt(limit);

    try {
        let response;

        if (aggregateBy) {
            let pipeline = [{ $match: query }];

            if (aggregateBy === 'eventType') {
                pipeline.push({
                    $group: {
                        _id: "$eventType",
                        totalEvents: { $sum: 1 }
                    }
                });
            } else if (aggregateBy === 'userId') {
                pipeline.push({
                    $group: {
                        _id: "$userId",
                        totalEvents: { $sum: 1 }
                    }
                });
            }

            pipeline.push({ $sort: { totalEvents: -1 } });

            pipeline.push({ $skip: skip }, { $limit: limitNumber });

            response = await analyticsModel.aggregate(pipeline);
        } else {
            response = await analyticsModel
                .find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limitNumber);
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
};



export const addEvent = async (req, res) => {
    const { eventType, userId, metadata } = req.body;

    try {
        const newEvent = new analyticsModel({
            eventType,
            userId,
            metadata
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error saving event' });
    }
}
