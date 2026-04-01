const express = require('express');
const router = express.Router();

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.get('/', async (req, res) => {
    const content = {
        headline: 'Build a stronger, healthier you',
        summary:
            'ActiveFam makes fitness tracking easy by combining calorie logging, workouts, sleep, steps, water, and weight entries into one dashboard.',
        howToUse: [
            'Create an account and log in to keep your data secure.',
            'Record workouts, meals, hydration, and rest so the app can generate meaningful reports.',
            'Use the weekly report and trend graphs to stay motivated and adjust your goals.',
        ],
        contactEmail: process.env.COMPANY_EMAIL || 'support@activefam.app',
        supportHours: 'Weekdays 9 AM - 6 PM (IST)',
    };

    res.json(createResponse(true, 'About information', content));
});

module.exports = router;
