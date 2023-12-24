import express from 'express';
import User from '../userModel';
import asyncHandler from "express-async-handler";

const router = express.Router(); // eslint-disable-line

// Delete a user
router.delete('/:username', asyncHandler(async (req, res) => {
    try {
        const username = req.params.username;
        const deletedUser = await User.findOneAndDelete({username: username});
        if (!deletedUser) {
            return res.status(404).json({success: false, msg: 'User not found.', code: 404});
        }
        res.status(200).json({success: true, msg: 'User successfully deleted.', result: deletedUser, code: 200});
    } catch (error) {
        // Log the error and return a generic error message
        console.error(error);
        res.status(500).json({success: false, msg: 'Internal server error.',code: 500});
    }
}));

export default router;