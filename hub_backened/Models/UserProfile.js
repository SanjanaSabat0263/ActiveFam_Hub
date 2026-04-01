const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    profileType: {
        type: String,
        enum: ['personal', 'family'],
        default: 'personal',
        required: true
    },
    goal: {
        type: String,
        required: true,
        enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'strength'],
    },
    activityLevel: {
        type: String,
        required: true,
        enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    },
    targetWeight: {
        type: Number,
        min: 0
    },
    fitnessPreferences: {
        preferredExercises: [String],
        equipmentAvailable: [String],
    },
    medicalNotes: String,
}, {
    timestamps: true,
});

userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ goal: 1, activityLevel: 1 });

userProfileSchema.pre('validate', function(next) {
    if (this.targetWeight && this.targetWeight < 30) {
        return next(new Error('Target weight must be at least 30 kg'));
    }
    next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);