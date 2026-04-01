const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exerciseName: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    intensity: {
        type: String,
        required: true,
        enum: ['low', 'moderate', 'high', 'very_high'],
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    sets: Number,
    reps: Number,
    weight: Number,
    caloriesBurned: Number,
    notes: String,
}, {
    timestamps: true,
});

workoutSchema.index({ userId: 1, date: -1 });
workoutSchema.index({ exerciseName: 1 });

workoutSchema.pre('validate', function(next) {
    if (this.date > new Date()) {
        return next(new Error('Workout date cannot be in the future'));
    }
    next();
});

module.exports = mongoose.model('Workout', workoutSchema);