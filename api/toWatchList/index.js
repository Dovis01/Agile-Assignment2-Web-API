import toWatchListModel from './toWatchListModel';
import asyncHandler from 'express-async-handler';
import express from 'express';

const router = express.Router();

//get all data documents of all users
router.get('/', asyncHandler(async (req, res) => {
    let {page = 1, limit = 5} = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    const [total_results, results] = await Promise.all([
        toWatchListModel.estimatedDocumentCount(),
        toWatchListModel.find().limit(limit).skip((page - 1) * limit)
    ]);
    const total_pages = Math.ceil(total_results / limit); //Calculate total number of pages (= total No Docs/Number of docs per page)

    //construct return Object and insert into response object
    const returnObject = {
        page,
        total_pages,
        total_results,
        results
    };
    res.status(200).json(returnObject);
}));

//get all movies to watch of a specific user
router.get('/:username', asyncHandler(async (req, res) => {
    const username = req.params.username;
    const toWatchListDoc = await toWatchListModel.findByUserName(username);
    if (toWatchListDoc) {
        res.status(200).json(toWatchListDoc);
    } else {
        res.status(404).json({success:false, message: 'The toWatchLists you requested of this user could not be found.', code: 404});
    }
}));

// insert a new id of movie to watch of a specific user
router.post('/:username/movies/:movieId', asyncHandler(async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const username = req.params.username;
        const toWatchListDoc = await toWatchListModel.findByUserName(username);
        if (toWatchListDoc) {
            await insertNewToWatchMovieId(movieId, username, res);
        } else {
            await firstInsertNewToWatchMovieId(movieId, username, res);
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));

//delete a specific id of movie to watch of a specific user
router.delete('/:username/movies/:movieId', asyncHandler(async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const username = req.params.username;
        await deleteToWatchList(movieId, username, res);
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));

/**
 * Insert Functions
 * */
async function firstInsertNewToWatchMovieId(movieId, username, res) {
    try {
        const newToWatchList = {
            username: username,
            toWatchList: [
                movieId
            ]
        };
        const toWatchListDoc = await toWatchListModel.create(newToWatchList);
        res.status(200).json({success: true, msg: 'The first id of movie to watch of this user is added successfully.', result: toWatchListDoc});
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

async function insertNewToWatchMovieId(movieId, username, res) {
    try {
        const insert = {
            $push: {
                toWatchList: [
                    movieId
                ]
            }
        };

        const insertedToWatchList = await toWatchListModel.findOneAndUpdate(
            {username: username},
            insert,
            {new: true}
        );

        if (insertedToWatchList) {
            res.status(200).json({success: true, msg: 'The new id of movie to watch of this user is added successfully.', result: insertedToWatchList});
        } else {
            res.status(404).json({success: false, msg: 'No toWatchList document is found to add.', code: 404});
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

/**
 * Delete Function
 * */
async function deleteToWatchList(movieId, username, res) {
    try {
        const deleteToWatchList = {
            $pull: {
                toWatchList: movieId
            }
        };

        const deleteToWatchListDoc = await toWatchListModel.findOneAndUpdate(
            {username: username, toWatchList: movieId},
            deleteToWatchList,
            {new: true}
        );

        if (deleteToWatchListDoc) {
            if (deleteToWatchListDoc.toWatchList.length === 0) {
                await toWatchListModel.deleteOne({ username: username});
                res.status(200).json({ success: true, msg: 'The id of movie to watch is deleted and no more ids of movies to watch left, so the entire document is deleted.', code: 200 });
            } else {
                res.status(200).json({ success: true, msg: 'The id of movie to watch is deleted successfully.', result: deleteToWatchListDoc });
            }
        } else {
            res.status(404).json({success: false, msg: 'The toWatchList document is not found to delete.', code: 404});
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

export default router;