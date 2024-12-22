const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');

// Get all buses
router.get('/', async (req, res) => {
    try {
        const buses = await Bus.find().populate('route');
        res.json(buses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get bus by ID
router.get('/:id', async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id).populate('route');
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update bus location
router.put('/:id/location', async (req, res) => {
    try {
        const { coordinates } = req.body;
        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates
                },
                lastUpdated: new Date()
            },
            { new: true }
        );
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        // Emit socket event for real-time updates
        req.app.get('io').emit('busLocationUpdate', bus);
        res.json(bus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create bus simulation route
router.post('/simulate', async (req, res) => {
    try {
        const { routeId } = req.body;
        // Start bus simulation for the given route
        // This would typically trigger a background process
        // that updates bus positions along the route
        res.json({ message: 'Bus simulation started' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
