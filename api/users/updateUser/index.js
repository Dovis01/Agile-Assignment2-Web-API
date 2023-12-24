import express from 'express';
import User, {passwordValidator} from '../userModel';
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

const router = express.Router(); // eslint-disable-line
const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'email', 'city', 'country', 'address'];

function validateUserUpdateFields(body) {
    for (let field of requiredFields) {
        if (body.hasOwnProperty(field) && !body[field]) {
            return `Field '${field}' cannot be empty.`;
        }
    }
    return null;
}

// Update a user
router.put('/:username', asyncHandler(async (req, res) => {
    try {
        const username = req.params.username;
        if (!req.body) {
            return res.status(400).json({success: false, msg: 'Lack the update information.', code: 400});
        }
        if (req.body.password) {
            await updateUserPassword(username, req, res);
        } else if (req.body.avatar) {
            await updateUserAvatar(username, req, res);
        } else {
            const fieldValidationMessage = validateUserUpdateFields(req.body);
            if (fieldValidationMessage) {
                return res.status(400).json({success: false, msg: fieldValidationMessage, code: 400});
            }
            await updateUserInfo(username, req, res);
        }
    } catch (error) {
        // Log the error and return a generic error message
        console.error(error);
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));


/**
 * Update Functions
 * */
async function updateUserInfo(username, req, res) {
    try {
        // Update user information except password and avatar
        const updatedUser = await User.findOneAndUpdate(
            {username: username},
            {$set: req.body},
            {new: true}
        );
        if (!updatedUser) {
            return res.status(404).json({success: false, msg: 'User not found', code: 404});
        }
        res.status(200).json({
            success: true,
            msg: 'User information updated successfully',
            user: updatedUser,
            code: 200
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, msg: 'Internal server error', code: 500});
    }
}

async function updateUserPassword(username, req, res) {
    try {
        const {password} = req.body;
        if (!passwordValidator(password)) {
            return res.status(400).json({
                success: false,
                msg: 'Password must be between 8 and 15 characters long and contain at least one number, one letter and one special character.',
                code: 400
            });
        }
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const updatedUser = await User.findOneAndUpdate(
            {username: username},
            {$set: {password: hash}},
            {new: true}
        ).lean();

        if (!updatedUser) {
            return res.status(404).json({success: false, msg: 'User not found', code: 404});
        }
        delete updatedUser.password;
        res.status(200).json({success: true, msg: 'Password updated successfully', user: updatedUser, code: 200});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, msg: 'Internal server error', code: 500});
    }
}

async function updateUserAvatar(username, req, res) {
    try {
        const updatedUser = await User.findOneAndUpdate(
            {username: username},
            {$set: {avatar: req.body.avatar}},
            {new: true}
        );
        if (!updatedUser) {
            return res.status(404).json({success: false, msg: 'User not found', code: 404});
        }
        res.status(200).json({success: true, msg: 'Avatar updated successfully', user: updatedUser, code: 200});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, msg: 'Internal server error', code: 500});
    }
}

export default router;