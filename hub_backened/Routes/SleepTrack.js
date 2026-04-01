const express = require('express');
const router = express.Router();

const authTokenHandler = require('../Middlewares/checkAuthToken');
const errorHandler = require('../Middlewares/errorMiddleware');
const User = require('../Models/UserSchema');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.post('/addsleepentry', authTokenHandler, async (req, res) => {
    const { date, durationInHrs } = req.body;

    if (!date || !durationInHrs) {
        return res.status(400).json(createResponse(false, 'Please provide date and sleep duration'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const newEntry = {
        id: Date.now().toString(), // Unique ID
        date: new Date(date),
        durationInHrs,
    };

    user.sleep.push(newEntry);

    await user.save();
    res.json(createResponse(true, 'Sleep entry added successfully', newEntry));
});

router.post('/getsleepbydate', authTokenHandler, async (req, res) => {
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.sleep = filterEntriesByDate(user.sleep, date);

        return res.json(createResponse(true, 'Sleep entries for today', user.sleep));
    }

    user.sleep = filterEntriesByDate(user.sleep, new Date(date));
    res.json(createResponse(true, 'Sleep entries for the date', user.sleep));
});


// has a bug
router.post('/getsleepbylimit', authTokenHandler, async (req, res) => {
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All sleep entries', user.sleep));
    } else {

        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();

   
        
        user.sleep = user.sleep.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        })

        return res.json(createResponse(true, `Sleep entries for the last ${limit} days`, user.sleep));
    }
});

router.put('/updatesleepentry/:id', authTokenHandler, async (req, res) => {
    const { id } = req.params;
    const { date, durationInHrs } = req.body;

    if (!date || !durationInHrs) {
        return res.status(400).json(createResponse(false, 'Please provide date and sleep duration'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const entryIndex = user.sleep.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
        return res.status(404).json(createResponse(false, 'Sleep entry not found'));
    }

    user.sleep[entryIndex] = {
        id,
        date: new Date(date),
        durationInHrs,
    };

    await user.save();
    res.json(createResponse(true, 'Sleep entry updated successfully', user.sleep[entryIndex]));
});

router.delete('/deletesleepentry/:id', authTokenHandler, async (req, res) => {
    const { id } = req.params;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const entryIndex = user.sleep.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
        return res.status(404).json(createResponse(false, 'Sleep entry not found'));
    }

    user.sleep.splice(entryIndex, 1);

    await user.save();
    res.json(createResponse(true, 'Sleep entry deleted successfully'));
});

router.get('/getallsleep', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    res.json(createResponse(true, 'All sleep entries', user.sleep));
});

    const goalSleep = 6;

    res.json(createResponse(true, 'User max sleep information', {goalSleep }));
});

router.use(errorHandler);

function filterEntriesByDate(entries, targetDate) {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
            entryDate.getDate() === targetDate.getDate() &&
            entryDate.getMonth() === targetDate.getMonth() &&
            entryDate.getFullYear() === targetDate.getFullYear()
        );
    });
}

module.exports = router;