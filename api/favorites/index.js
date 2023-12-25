import favoriteModel from './favoriteModel';
import asyncHandler from 'express-async-handler';
import express from 'express';

const router = express.Router();

//get all data documents of all users
router.get('/', asyncHandler(async (req, res) => {
    let {page = 1, limit = 5} = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    const [total_results, results] = await Promise.all([
        favoriteModel.estimatedDocumentCount(),
        favoriteModel.find().limit(limit).skip((page - 1) * limit)
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

//get all favorite movies of a specific user
router.get('/:username', asyncHandler(async (req, res) => {
    const username = req.params.username;
    const favorites = await favoriteModel.findByUserName(username);
    if (favorites) {
        res.status(200).json(favorites);
    } else {
        res.status(404).json({success:false, message: 'The favorites you requested of this user could not be found.', code: 404});
    }
}));

// insert a new favorite movie id of a specific user
router.post('/:username/movies/:movieId', asyncHandler(async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const username = req.params.username;
        const favorites = await favoriteModel.findByUserName(username);
        if (favorites) {
            await insertNewFavoriteMovieId(movieId, username, res);
        } else {
            await firstInsertNewFavoriteMovieId(movieId, username, res);
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));

//delete a specific favorite movie id of a specific user
router.delete('/:username/movies/:movieId', asyncHandler(async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const username = req.params.username;
        await deleteFavorite(movieId, username, res);
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));

/**
 * Insert Functions
 * */
async function firstInsertNewFavoriteMovieId(movieId, username, res) {
    try {
        const newFavorite = {
            username: username,
            favorites: [
                movieId
            ]
        };
        const favoritesDoc = await favoriteModel.create(newFavorite);
        res.status(200).json({success: true, msg: 'The first favorite movie id of this user is added successfully.', result: favoritesDoc});
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

async function insertNewFavoriteMovieId(movieId, username, res) {
    try {
        const insert = {
            $push: {
                favorites: [
                    movieId
                ]
            }
        };

        const insertedFavorites = await favoriteModel.findOneAndUpdate(
            {username: username},
            insert,
            {new: true}
        );

        if (insertedFavorites) {
            res.status(200).json({success: true, msg: 'The new favorite movie id of this user is added successfully.', result: insertedFavorites});
        } else {
            res.status(404).json({success: false, msg: 'No favorites document is found to add.', code: 404});
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

/**
 * Delete Function
 * */
async function deleteFavorite(movieId, username, res) {
    try {
        const deleteFavorite = {
            $pull: {
                favorites: movieId
            }
        };

        const deletedFavorites = await favoriteModel.findOneAndUpdate(
            {username: username, favorites: movieId},
            deleteFavorite,
            {new: true}
        );

        if (deletedFavorites) {
            if (deletedFavorites.favorites.length === 0) {
                await favoriteModel.deleteOne({ username: username});
                res.status(200).json({ success: true, msg: 'The favorite movie id is deleted and no more favorite movie ids left, so the entire document is deleted.', code: 200 });
            } else {
                res.status(200).json({ success: true, msg: 'The favorite movie id is deleted successfully.', result: deletedFavorites });
            }
        } else {
            res.status(404).json({success: false, msg: 'The favorite document is not found to delete.', code: 404});
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

export default router;