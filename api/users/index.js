import express from 'express';
import jwt from 'jsonwebtoken';
import User from './userModel';
import asyncHandler from "express-async-handler";

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', asyncHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
}));

router.get('/:username', asyncHandler(async (req, res) => {
    const user = await User.findOne({username: req.params.username});
    if(!user) return res.status(404).json({success: false, msg: 'User not found.', code: 404})
    res.status(200).json(user);
}));

// register(Create)/Authenticate User
router.post('/', asyncHandler(async (req, res) => {
    try {
        if (req.query.authMethod === 'username') {
            if (!req.body.username || !req.body.password) {
                return res.status(400).json({success: false, msg: 'Username and password are required.', code: 400});
            }
            await authenticateUserByUsername(req, res);
        }
        if (req.query.authMethod === 'email') {
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({success: false, msg: 'Email and password are required.', code: 400});
            }
            await authenticateUserByEmail(req, res);
        }
        if (req.query.action === 'register') {
            await registerUser(req, res);
        }
    } catch (error) {
        // Log the error and return a generic error message
        console.error(error);
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));


/**
 * Post Functions
 * */
async function registerUser(req, res) {
    let userUsername = await User.findByUserName(req.body.username);
    let userEmail = await User.findByEmail(req.body.email);
    if (userUsername) {
        return res.status(401).json({success: false, msg: 'Username already exists.', code: 401});
    }
    if (userEmail) {
        return res.status(401).json({success: false, msg: 'Email already exists.', code: 401});
    }
    // Add input validation logic here
    await User.create(req.body);
    res.status(201).json({success: true, msg: 'User successfully created.', code: 201});
}

async function authenticateUserByUsername(req, res) {
    const user = await User.findByUserName(req.body.username);
    if (!user) {
        return res.status(404).json({
            success: false,
            msg: 'Authentication failed. User not found. Please check your username.',
            code: 404
        });
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (isMatch) {
        const token = jwt.sign({username: user.username}, process.env.SECRET);
        res.status(200).json({success: true, token: 'BEARER ' + token, email: user.email, code: 200});
    } else {
        res.status(401).json({success: false, msg: 'Wrong password.', code: 401});
    }
}

async function authenticateUserByEmail(req, res) {
    const user = await User.findByEmail(req.body.email);
    if (!user) {
        return res.status(404).json({
            success: false,
            msg: 'Authentication failed. User not found. Please check your email.',
            code: 404
        });
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (isMatch) {
        const token = jwt.sign({email: user.email}, process.env.SECRET);
        res.status(200).json({success: true, token: 'BEARER ' + token, username: user.username,code: 200});
    } else {
        res.status(401).json({success: false, msg: 'Wrong password.', code: 401});
    }
}

export default router;