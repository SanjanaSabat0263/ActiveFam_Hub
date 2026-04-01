const express = require('express');
const router = express.Router();

const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');
const Workout = require('../Models/Workout');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

// POST /workouts - Create a new workout
router.post('/', authTokenHandler, async (req, res) => {
    try {
        const { exerciseName, duration, intensity, date, sets, reps, weight, caloriesBurned, notes } = req.body;

        // Validation
        if (!exerciseName || !duration || !intensity) {
            return res.status(400).json(createResponse(false, 'exerciseName, duration, and intensity are required'));
        }

        const userId = req.userId;

        const workout = new Workout({
            userId,
            exerciseName,
            duration,
            intensity,
            date: date ? new Date(date) : new Date(),
            sets,
            reps,
            weight,
            caloriesBurned,
            notes,
        });

        await workout.save();

        res.status(201).json(createResponse(true, 'Workout created successfully', { workoutId: workout._id }));
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

// GET /workouts - Get all workouts for user
router.get('/', authTokenHandler, async (req, res) => {
    try {
        const userId = req.userId;
        const { date, limit = 10 } = req.query;

        let query = { userId };
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            query.date = { $gte: start, $lt: end };
        }

        const workouts = await Workout.find(query).sort({ date: -1 }).limit(parseInt(limit));

        res.json(createResponse(true, 'Workouts retrieved successfully', workouts));
    } catch (error) {
        console.error('Error retrieving workouts:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

// GET /workouts/:id - Get specific workout
router.get('/:id', authTokenHandler, async (req, res) => {
    try {
        const userId = req.userId;
        const workout = await Workout.findOne({ _id: req.params.id, userId });

        if (!workout) {
            return res.status(404).json(createResponse(false, 'Workout not found'));
        }

        res.json(createResponse(true, 'Workout retrieved successfully', workout));
    } catch (error) {
        console.error('Error retrieving workout:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

// PUT /workouts/:id - Update workout
router.put('/:id', authTokenHandler, async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;

        const workout = await Workout.findOneAndUpdate(
            { _id: req.params.id, userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!workout) {
            return res.status(404).json(createResponse(false, 'Workout not found'));
        }

        res.json(createResponse(true, 'Workout updated successfully', workout));
    } catch (error) {
        console.error('Error updating workout:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

// DELETE /workouts/:id - Delete workout
router.delete('/:id', authTokenHandler, async (req, res) => {
    try {
        const userId = req.userId;
        const workout = await Workout.findOneAndDelete({ _id: req.params.id, userId });

        if (!workout) {
            return res.status(404).json(createResponse(false, 'Workout not found'));
        }

        res.json(createResponse(true, 'Workout deleted successfully'));
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

module.exports = router;