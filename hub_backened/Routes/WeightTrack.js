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

router.post('/addweightentry', authTokenHandler, async (req, res) => {
    const { date, weightInKg } = req.body;

    if (!date || !weightInKg) {
        return res.status(400).json(createResponse(false, 'Please provide date and weight'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const newEntry = {
        id: Date.now().toString(),
        date: new Date(date),
        weightInKg,
    };

    user.weight.push(newEntry);

    await user.save();
    res.json(createResponse(true, 'Weight entry added successfully', newEntry));
});

router.post('/getweightbydate', authTokenHandler, async (req, res) => {
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.weight = filterEntriesByDate(user.weight, date);

        return res.json(createResponse(true, 'Weight entries for today', user.weight));
    }

    user.weight = filterEntriesByDate(user.weight, new Date(date));
    res.json(createResponse(true, 'Weight entries for the date', user.weight));
});


// has a bug
router.post('/getweightbylimit', authTokenHandler, async (req, res) => {
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All weight entries', user.weight));
    } else {
        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();

 
        user.weight = user.weight.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        })

        return res.json(createResponse(true, `Weight entries for the last ${limit} days`, user.weight));
    }
});

router.put('/updateweightentry/:id', authTokenHandler, async (req, res) => {
    const { id } = req.params;
    const { date, weightInKg } = req.body;

    if (!date || !weightInKg) {
        return res.status(400).json(createResponse(false, 'Please provide date and weight'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const entryIndex = user.weight.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
        return res.status(404).json(createResponse(false, 'Weight entry not found'));
    }

    user.weight[entryIndex] = {
        id,
        date: new Date(date),
        weightInKg,
    };

    await user.save();
    res.json(createResponse(true, 'Weight entry updated successfully', user.weight[entryIndex]));
});

router.delete('/deleteweightentry/:id', authTokenHandler, async (req, res) => {
    const { id } = req.params;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const entryIndex = user.weight.findIndex(entry => entry.id === id);
    if (entryIndex === -1) {
        return res.status(404).json(createResponse(false, 'Weight entry not found'));
    }

    user.weight.splice(entryIndex, 1);

    await user.save();
    res.json(createResponse(true, 'Weight entry deleted successfully'));
});

router.get('/getallweight', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    res.json(createResponse(true, 'All weight entries', user.weight));
});


// has a bug
router.get('/getusergoalweight', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const currentWeight = user.weight.length > 0 ? user.weight[user.weight.length - 1].weight : null;
    const goalWeight = 22 * ((user.height[user.height.length - 1].height / 100) ** 2);

    res.json(createResponse(true, 'User goal weight information', { currentWeight, goalWeight }));
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