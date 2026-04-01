const express = require('express');
const router = express.Router();
const User = require('../Models/UserSchema')
const errorHandler = require('../Middlewares/errorMiddleware');
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

//uwue zyji yfpf ydyc
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.COMPANY_EMAIL || 'sanjanasabat2005@zohomail.in',
        pass: process.env.EMAIL_APP_PASSWORD || 'uwuezyjiyfpfydyc'
    }
})

router.get('/test', async (req, res) => {
    res.json({
        message: "Auth api is working"
    })
})

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

router.post('/register', async (req, res, next) => {
    console.log(req.body);
    try {
        const { name, email, password, weightInKg, heightInCm, gender, dob, goal, activityLevel } = req.body;
        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json(createResponse(false, 'Email already exists'));
        }
        const newUser = new User({
            name,
            password,
            email,
            weight: [
                {
                    weight: weightInKg,
                    unit: "kg",
                    date: Date.now()
                }
            ],
            height: [
                {
                    height: heightInCm,
                    date: Date.now(),
                    unit: "cm"
                }
            ],
            gender,
            dob,
            goal,
            activityLevel
        });
        await newUser.save(); // Await the save operation
        try {
            const mailOptions = {
                from: process.env.COMPANY_EMAIL || 'sanjanasabat2005@zohomail.in',
                to: email,
                subject: 'Welcome to ActiveFam',
                text: `Hi ${name},\n\nWelcome to ActiveFam! Your account is ready. Start logging your meals, workouts, and habits to unlock progress reports.\n\nStay active,\nActiveFam Team`
            };
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.error('Failed to send welcome email', mailError);
        }

        res.status(201).json(createResponse(true, 'User registered successfully'));

    }
    catch (err) {
        next(err);
    }
})
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(createResponse(false, 'Invalid credentials'));
        }

        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '365d' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '365d' });

        // Set cookies for local development (localhost, not HTTPS)
        const cookieOpts = {
            httpOnly: true,
            sameSite: 'Lax', // 'Lax' is best for localhost
            secure: false,   // Only true for HTTPS
        };

        res.cookie('authToken', authToken, cookieOpts);
        res.cookie('refreshToken', refreshToken, cookieOpts);
        res.status(200).json(createResponse(true, 'Login successful', {
            authToken,
            refreshToken
        }));
    }
    catch (err) {
        next(err);
    }
})
router.post('/logout', (req, res) => {
    const cookieOpts = {
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
    };
    res.clearCookie('authToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);
    res.json(createResponse(true, 'Logged out successfully'));
});
router.post('/sendotp', async (req, res, next) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);

        const mailOptions = {
            from: 'sanjanasabat2005@zohomail.in',
            to: email,
            subject: 'OTP for verification',
            text: `Your OTP is ${otp}`
        }

        transporter.sendMail(mailOptions, async (err, info) => {
            if (err) {
                console.log(err);
                res.status(500).json(createResponse(false, err.message));
            } else {
                res.json(createResponse(true, 'OTP sent successfully', { otp }));
            }
        });
    }
    catch (err) {
        next(err);
    }
})
router.post('/checklogin', authTokenHandler, async (req, res, next) => {
    res.json({
        ok: true,
        message: 'User authenticated successfully'
    })
})
router.use(errorHandler)

module.exports = router;
