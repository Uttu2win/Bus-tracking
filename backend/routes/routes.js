const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Bus = require('../models/Bus');

// Get all routes
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find().populate('buses');
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific route
router.get('/:id', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id).populate('buses');
        if (route) {
            res.json(route);
        } else {
            res.status(404).json({ message: 'Route not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new route
router.post('/', async (req, res) => {
    const route = new Route({
        name: req.body.name,
        description: req.body.description,
        path: req.body.path,
        estimatedDuration: req.body.estimatedDuration,
        schedule: req.body.schedule
    });

    try {
        const newRoute = await route.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a route
router.patch('/:id', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (route) {
            Object.keys(req.body).forEach(key => {
                route[key] = req.body[key];
            });
            const updatedRoute = await route.save();
            res.json(updatedRoute);
        } else {
            res.status(404).json({ message: 'Route not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a route
router.delete('/:id', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (route) {
            await route.remove();
            // Remove route reference from all buses
            await Bus.updateMany(
                { route: req.params.id },
                { $unset: { route: 1 } }
            );
            res.json({ message: 'Route deleted' });
        } else {
            res.status(404).json({ message: 'Route not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
