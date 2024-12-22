const Bus = require('../models/Bus');
const Route = require('../models/Route');

function interpolatePosition(start, end, progress) {
    return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress
    ];
}

function initBusSimulation(io) {
    const updateInterval = 5000; // Update every 5 seconds

    const simulateBusMovement = async () => {
        try {
            // Get all active buses
            const buses = await Bus.find({ status: 'active' }).populate('route');

            for (const bus of buses) {
                if (!bus.route) continue;

                // Get route path points
                const path = bus.route.path;
                if (path.length < 2) continue;

                // Update bus position along the route
                bus.currentPathIndex = (bus.currentPathIndex || 0) % (path.length - 1);
                const startPoint = path[bus.currentPathIndex].coordinates;
                const endPoint = path[bus.currentPathIndex + 1].coordinates;

                // Calculate progress (0 to 1) based on time
                const progress = (Date.now() % updateInterval) / updateInterval;
                const newPosition = interpolatePosition(startPoint, endPoint, progress);

                // Update bus location
                bus.currentLocation = {
                    type: 'Point',
                    coordinates: newPosition
                };
                await bus.save();

                // Emit update to connected clients
                io.emit('busLocationUpdate', {
                    busId: bus._id,
                    position: newPosition,
                    routeId: bus.route._id,
                    status: bus.status,
                    currentOccupancy: bus.currentOccupancy,
                    capacity: bus.capacity,
                    lastUpdated: new Date()
                });

                // Move to next path segment
                if (progress >= 1) {
                    bus.currentPathIndex = (bus.currentPathIndex + 1) % (path.length - 1);
                }
            }
        } catch (error) {
            console.error('Error in bus simulation:', error);
        }
    };

    // Start the simulation loop
    setInterval(simulateBusMovement, updateInterval);
}

module.exports = {
    initBusSimulation
};
