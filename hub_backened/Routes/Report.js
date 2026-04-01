const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const User = require('../Models/UserSchema');
require('dotenv').config();
require('../db');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

function isSameDay(first, second) {
    return (
        first.getDate() === second.getDate() &&
        first.getMonth() === second.getMonth() &&
        first.getFullYear() === second.getFullYear()
    );
}

function isInRange(date, start, end) {
    return date >= start && date <= end;
}

function safeAverage(sum, count) {
    return count ? Math.round(sum / count) : 0;
}

router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for report'));
});

router.get('/getreport', authTokenHandler, async (req, res) => {
    try {
        const user = await User.findById({ _id: req.userId });
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        const today = new Date();
        const weeklyWindowStart = new Date(today);
        weeklyWindowStart.setDate(today.getDate() - 6);

        const caloriesThisWeek = user.calorieIntake.filter((entry) =>
            isInRange(entry.date, weeklyWindowStart, today)
        );
        const calorieTotalToday = caloriesThisWeek.reduce((sum, entry) => {
            return isSameDay(entry.date, today) ? sum + entry.calorieIntake : sum;
        }, 0);
        const caloriesByDay = caloriesThisWeek.reduce((acc, entry) => {
            const key = entry.date.toISOString().split('T')[0];
            acc[key] = (acc[key] || 0) + entry.calorieIntake;
            return acc;
        }, {});

        const lastWeight = user.weight.slice(-1)[0] ?? null;
        const lastHeight = user.height.slice(-1)[0] ?? null;

        const stepsThisWeek = user.steps.filter((entry) =>
            isInRange(entry.date, weeklyWindowStart, today)
        );
        const totalWeeklySteps = stepsThisWeek.reduce((sum, entry) => sum + entry.steps, 0);
        const averageDailySteps = safeAverage(totalWeeklySteps, 7);

        const sleepThisWeek = user.sleep.filter((entry) =>
            isInRange(entry.date, weeklyWindowStart, today)
        );
        const totalSleep = sleepThisWeek.reduce((sum, entry) => sum + entry.durationInHrs, 0);
        const averageSleep = safeAverage(totalSleep, sleepThisWeek.length);

        const waterThisWeek = user.water.filter((entry) =>
            isInRange(entry.date, weeklyWindowStart, today)
        );
        const totalWater = waterThisWeek.reduce(
            (sum, entry) => sum + entry.amountInMilliliters,
            0
        );
        const averageWater = safeAverage(totalWater, waterThisWeek.length);

        const report = {
            goal: user.goal,
            activityLevel: user.activityLevel,
            latestWeight: lastWeight,
            latestHeight: lastHeight,
            caloriesToday: calorieTotalToday,
            caloriesByDay,
            weeklyAverageSteps: averageDailySteps,
            weeklyAverageSleep: averageSleep,
            weeklyAverageWater: averageWater,
        };

        res.json(createResponse(true, 'Report generated', report));
    } catch (error) {
        console.error('Report generation failed:', error);
        res.status(500).json(createResponse(false, 'Unable to build report', error.message));
    }
});

module.exports = router;
