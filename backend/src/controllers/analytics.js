import analyticsModel from "../models/analytics.js";

export const getAnalytics = async (req, res) => {
    const { page = 1, limit = 10, eventType, userId, startDate, endDate, aggregateBy } = req.query;

    const query = {};

    //filterssss
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

    let pipeline = [
        { $match: query },
        { $skip: skip },
        { $limit: limitNumber },
        { $sort: { timestamp: -1 } }
    ];

    if (aggregateBy) {
        if (aggregateBy === 'eventType') {
            pipeline = [
                { $match: query },
                {
                    $group: {
                        _id: "$eventType",
                        totalEvents: { $sum: 1 }
                    }
                },
                { $sort: { totalEvents: -1 } }
            ];
        } else if (aggregateBy === 'userId') {
            pipeline = [
                { $match: query },
                {
                    $group: {
                        _id: "$userId",
                        totalEvents: { $sum: 1 }
                    }
                },
                { $sort: { totalEvents: -1 } }
            ];
        }
    }

    try {
        const aggregationResults = await analyticsModel.aggregate(pipeline);
        res.json(aggregationResults);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
}


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
