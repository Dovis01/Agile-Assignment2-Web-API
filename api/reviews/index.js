import reviewModel from './reviewModel';
import asyncHandler from 'express-async-handler';
import express from 'express';

const router = express.Router();
let randomInt = Math.floor(Math.random() * 4001);

//get all movies reviews of all users
router.get('/', asyncHandler(async (req, res) => {
    let {page = 1, limit = 5} = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    // Parallel execution of counting movies and getting movies using reviewModel
    const [total_results, results] = await Promise.all([
        reviewModel.estimatedDocumentCount(),
        reviewModel.find().limit(limit).skip((page - 1) * limit)
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

//get all movie ids reviewed of a specific user
router.get('/:username', asyncHandler(async (req, res) => {
    const username = req.params.username;
    const moiveIds = await reviewModel.findByUserName(username);
    if (moiveIds) {
        res.status(200).json(moiveIds);
    } else {
        res.status(404).json({message: 'The reviews you requested of this user could not be found.', status_code: 404});
    }
}));

//get specific user's reviews in a specific movie
router.get('/:username/movies/:movieId', asyncHandler(async (req, res) => {
    const movieId = parseInt(req.params.movieId);
    const username = req.params.username;
    const reviews = await reviewModel.findByUserNameAndMovieId(username, movieId);
    if (reviews) {
        res.status(200).json(reviews);
    } else {
        res.status(404).json({message: 'The reviews you requested could not be found.', status_code: 404});
    }
}));

// get a specific review
router.get('/:reviewId/:username/movies/:movieId', asyncHandler(async (req, res) => {
    const reviewId = req.params.reviewId;
    const movieId = parseInt(req.params.movieId);
    const username = req.params.username;
    const review = await reviewModel.findByUserNameMovieIdAndReviewId(username, movieId, reviewId);
    if (review) {
        res.status(200).json(review);
    } else {
        res.status(404).json({message: 'The review you requested could not be found.', status_code: 404});
    }
}));

// insert a new review
router.post('/:username/movies/:movieId', asyncHandler(async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const username = req.params.username;
        const reviews = await reviewModel.findByUserNameAndMovieId(username, movieId);
        if (!req.body.author || !req.body.rating || !req.body.content) {
            return res.status(400).json({success: false, msg: 'Author,rating and content are required.'});
        }
        if (reviews) {
            await insertNewReview(movieId, username, req, res);
        } else {
            await firstInsertNewReview(movieId, username, req, res);
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));

//update a specific review
router.put('/:reviewId/:username/movies/:movieId', asyncHandler(async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const username = req.params.username;
        const reviewId = req.params.reviewId;
        if (!req.body.author || !req.body.rating || !req.body.content) {
            return res.status(400).json({success: false, msg: 'Author,rating and content are required.'});
        }
        await updateReview(movieId, username, reviewId, req, res);
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));

//delete a specific review
router.delete('/:reviewId/:username/movies/:movieId', asyncHandler(async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const username = req.params.username;
        const reviewId = req.params.reviewId;
        await deleteReview(movieId, username, reviewId, req, res);
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}));

/**
 * Insert Functions
 * */
async function firstInsertNewReview(movieId, username, req, res) {
    try {
        const newReview = {
            username: username,
            movieId: movieId,
            reviews: [{
                id: movieId + randomInt,
                author: req.body.author,
                rating: req.body.rating,
                content: req.body.content
            }]
        };
        const reviewsDoc = await reviewModel.create(newReview);
        res.status(200).json({success: true, msg: 'The first review is added successfully.', result: reviewsDoc});
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

async function insertNewReview(movieId, username, req, res) {
    try {
        const insert = {
            $push: {
                reviews: {
                    id: movieId + randomInt,
                    author: req.body.author,
                    rating: req.body.rating,
                    content: req.body.content
                }
            }
        };

        const insertedReviews = await reviewModel.findOneAndUpdate(
            {username: username, movieId: movieId},
            insert,
            {new: true}
        );

        if (insertedReviews) {
            res.status(200).json({success: true, msg: 'The review is added successfully.', result: insertedReviews});
        } else {
            res.status(404).json({success: false, msg: 'No reviews document is found to add.', code: 404});
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

/**
 * Update Functions
 * */
async function updateReview(movieId, username, reviewId, req, res) {
    try {
        const update = {
            $set: {
                'reviews.$.author': req.body.author,
                'reviews.$.rating': req.body.rating,
                'reviews.$.content': req.body.content
            }
        };

        const updatedReviews = await reviewModel.findOneAndUpdate(
            {username: username, movieId: movieId, 'reviews.id': reviewId},
            update,
            {new: true}
        );

        if (updatedReviews) {
            const updatedReview = updatedReviews.reviews.find(review => review._id.toString() === reviewId);
            res.status(200).json({success: true, msg: 'The review is updated successfully.', result: updatedReview});
        } else {
            res.status(404).json({success: false, msg: 'The review document is not found to update.', code: 404});
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

/**
 * Delete Functions
 * */
async function deleteReview(movieId, username, reviewId, req, res) {
    try {
        const deleteReview = {
            $pull: {
                reviews: {
                    id: reviewId
                }
            }
        };

        const deletedReviews = await reviewModel.findOneAndUpdate(
            {username: username, movieId: movieId, 'reviews.id': reviewId},
            deleteReview,
            {new: true}
        );

        if (deletedReviews) {
            if (deletedReviews.reviews.length === 0) {
                await reviewModel.deleteOne({username: username, movieId: movieId});
                res.status(200).json({
                    success: true,
                    msg: 'The review is deleted and no more reviews left, so the entire document is deleted.',
                    code: 200
                });
            } else {
                res.status(200).json({
                    success: true,
                    msg: 'The review is deleted successfully.',
                    result: deletedReviews
                });
            }
        } else {
            res.status(404).json({success: false, msg: 'The review document is not found to delete.', code: 404});
        }
    } catch (error) {
        res.status(500).json({success: false, msg: 'Internal server error.', code: 500});
    }
}

export default router;