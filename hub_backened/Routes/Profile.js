const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const User = require('../Models/UserSchema');
const UserProfile = require('../Models/UserProfile');
require('../db');

function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}

function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateBMR(weightKg, heightCm, age, gender) {
    if (!weightKg || !heightCm || !age || !gender) return null;
    if (gender === 'female') {
        return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
    }
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
}

function dailyStepsTarget(activityLevel) {
    switch (activityLevel) {
        case 'extremely_active':
            return 12000;
        case 'very_active':
            return 11000;
        case 'moderately_active':
            return 9000;
        case 'lightly_active':
            return 7500;
        default:
            return 6000;
    }
}

router.get('/', authTokenHandler, async (req, res) => {
    try {
        const user = await User.findById({ _id: req.userId }).lean();
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        const userProfiles = await UserProfile.find({ userId: req.userId }).lean();

        const lastWeightEntry = user.weight.slice(-1)[0] ?? null;
        const lastHeightEntry = user.height.slice(-1)[0] ?? null;

        const age = calculateAge(user.dob);
        const bmr = calculateBMR(
            lastWeightEntry?.weight,
            lastHeightEntry?.height,
            age,
            user.gender
        );

        const calorieGoal =
            user.goal === 'weightLoss'
                ? bmr
                    ? Math.max(Math.round(bmr - 500), 1200)
                    : null
                : user.goal === 'weightGain'
                    ? bmr
                        ? Math.round(bmr + 400)
                        : null
                    : bmr
                        ? Math.round(bmr)
                        : null;

        const personalProfile = userProfiles.find(p => p.profileType === 'personal') || userProfiles[0];

        const dailyGoals = {
            calorieBudget: calorieGoal,
            hydrationMl: 3000,
            steps: dailyStepsTarget(personalProfile?.activityLevel ?? user.activityLevel),
            focus: personalProfile?.goal ?? user.goal ?? 'healthy lifestyle',
        };

        const personalInfo = {
            name: user.name,
            email: user.email,
            gender: user.gender,
            age,
            dob: user.dob,
            goal: user.goal,
            activityLevel: user.activityLevel,
            bio: personalProfile?.medicalNotes ?? 'No additional notes provided.',
        };

        const profileData = userProfiles.map(profile => ({
            profileType: profile.profileType,
            goal: profile.goal,
            activityLevel: profile.activityLevel,
            targetWeight: profile.targetWeight,
            preferredExercises: profile.fitnessPreferences?.preferredExercises ?? [],
            equipmentAvailable: profile.fitnessPreferences?.equipmentAvailable ?? [],
            medicalNotes: profile.medicalNotes ?? 'No additional notes provided.',
        }));

        const response = {
            personalInfo,
            dailyGoals,
            latestMetrics: {
                weight: lastWeightEntry?.weight ?? null,
                height: lastHeightEntry?.height ?? null,
                bmi:
                    lastWeightEntry && lastHeightEntry
                        ? parseFloat(
                              (
                                  (lastWeightEntry.weight /
                                      Math.pow(lastHeightEntry.height / 100, 2))
                              ).toFixed(1)
                          )
                        : null,
            },
            profiles: profileData,
        };

        res.json(createResponse(true, 'Profile summary', response));
    } catch (error) {
        console.error('Failed to load profile summary', error);
        res.status(500).json(createResponse(false, 'Unable to load profile summary'));
    }
});

module.exports = router;
