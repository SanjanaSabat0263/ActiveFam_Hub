const express = require('express');
const router = express.Router();

const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');
const UserProfile = require('../Models/UserProfile');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

// POST /user-profiles - Create or update user profile
router.post('/', authTokenHandler, async (req, res) => {
    try {
        const { goal, activityLevel, targetWeight, fitnessPreferences, medicalNotes, profileType = 'personal' } = req.body;

        if (!goal || !activityLevel) {
            return res.status(400).json(createResponse(false, 'goal and activityLevel are required'));
        }

        const userId = req.userId;

        // Upsert: create if not exists, update if exists
        const profile = await UserProfile.findOneAndUpdate(
            { userId, profileType },
            {
                goal,
                activityLevel,
                targetWeight,
                fitnessPreferences,
                medicalNotes,
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(201).json(createResponse(true, 'User profile saved successfully', profile));
    } catch (error) {
        console.error('Error saving user profile:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

// GET /user-profiles - Get user profiles
router.get('/', authTokenHandler, async (req, res) => {
    try {
        const userId = req.userId;
        const profiles = await UserProfile.find({ userId });

        res.json(createResponse(true, 'User profiles retrieved successfully', profiles));
    } catch (error) {
        console.error('Error retrieving user profiles:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

// PUT /user-profiles - Update user profile
router.put('/', authTokenHandler, async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;

        const profile = await UserProfile.findOneAndUpdate(
            { userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json(createResponse(false, 'User profile not found'));
        }

        res.json(createResponse(true, 'User profile updated successfully', profile));
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

// DELETE /user-profiles - Delete user profile
router.delete('/', authTokenHandler, async (req, res) => {
    try {
        const userId = req.userId;
        const profile = await UserProfile.findOneAndDelete({ userId });

        if (!profile) {
            return res.status(404).json(createResponse(false, 'User profile not found'));
        }

        res.json(createResponse(true, 'User profile deleted successfully'));
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json(createResponse(false, 'Internal server error'));
    }
});

module.exports = router;