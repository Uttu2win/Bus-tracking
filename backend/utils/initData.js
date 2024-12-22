const mongoose = require('mongoose');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
require('dotenv').config();

const sampleRoutes = [
    {
        name: 'Route 1: City Center to College',
        description: 'Main route via downtown',
        path: [
            {
                type: 'Point',
                coordinates: [78.9629, 20.5937],
                name: 'City Center Stop',
                isStop: true
            },
            {
                type: 'Point',
                coordinates: [78.9650, 20.5960],
                name: 'Market Square',
                isStop: true
            },
            {
                type: 'Point',
                coordinates: [78.9680, 20.5980],
                name: 'College Campus',
                isStop: true
            }
        ],
        estimatedDuration: 45,
        schedule: [
            {
                departureTime: '08:00',
                arrivalTime: '08:45',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            {
                departureTime: '09:00',
                arrivalTime: '09:45',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            }
        ]
    },
    {
        name: 'Route 2: Residential Area to College',
        description: 'Express route from residential area',
        path: [
            {
                type: 'Point',
                coordinates: [78.9700, 20.5900],
                name: 'Residential Complex',
                isStop: true
            },
            {
                type: 'Point',
                coordinates: [78.9720, 20.5940],
                name: 'Shopping Mall',
                isStop: true
            },
            {
                type: 'Point',
                coordinates: [78.9680, 20.5980],
                name: 'College Campus',
                isStop: true
            }
        ],
        estimatedDuration: 30,
        schedule: [
            {
                departureTime: '07:30',
                arrivalTime: '08:00',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            {
                departureTime: '08:30',
                arrivalTime: '09:00',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            }
        ]
    }
];

const sampleBuses = [
    {
        busNumber: 'BUS101',
        currentLocation: {
            type: 'Point',
            coordinates: [78.9629, 20.5937]
        },
        status: 'active',
        capacity: 40,
        currentOccupancy: 25
    },
    {
        busNumber: 'BUS102',
        currentLocation: {
            type: 'Point',
            coordinates: [78.9700, 20.5900]
        },
        status: 'active',
        capacity: 40,
        currentOccupancy: 30
    }
];

async function initializeData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-tracking');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Route.deleteMany({});
        await Bus.deleteMany({});
        console.log('Cleared existing data');

        // Insert routes
        const createdRoutes = await Route.insertMany(sampleRoutes);
        console.log('Created routes:', createdRoutes.map(r => r.name));

        // Assign routes to buses and insert buses
        const buses = sampleBuses.map((bus, index) => ({
            ...bus,
            route: createdRoutes[index]._id
        }));
        const createdBuses = await Bus.insertMany(buses);
        console.log('Created buses:', createdBuses.map(b => b.busNumber));

        // Update routes with bus references
        for (let i = 0; i < createdRoutes.length; i++) {
            await Route.findByIdAndUpdate(createdRoutes[i]._id, {
                $push: { buses: createdBuses[i]._id }
            });
        }

        console.log('Successfully initialized sample data');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing data:', error);
        process.exit(1);
    }
}

initializeData();
