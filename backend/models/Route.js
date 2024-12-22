const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isStop: {
        type: Boolean,
        default: false
    }
});

const scheduleSchema = new mongoose.Schema({
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    },
    days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
});

const routeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    path: [pointSchema],
    estimatedDuration: {
        type: Number,
        required: true
    },
    schedule: [scheduleSchema],
    buses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update the updatedAt timestamp before saving
routeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create indexes for efficient querying
routeSchema.index({ name: 1 });
routeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Route', routeSchema);
