import movieModel from './movieModel';
import {
    getDiscoverMovies, getMovieReviews, getMovieVideos,
    getGenres, getMovie, getMovieCredits, getMovieImages,
    getMovieRecommendations, getNowPlayingMovies,
    getUpcomingMovies, getWeekTrendingMovies
} from '../tmdb-api';
import asyncHandler from 'express-async-handler';
import express from 'express';

const router = express.Router();

//Get all movies data from database storage
router.get('/', asyncHandler(async (req, res) => {
    let {page = 1, limit = 10} = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    // Parallel execution of counting movies and getting movies using movieModel
    const [total_results, results] = await Promise.all([
        movieModel.estimatedDocumentCount(),
        movieModel.find().limit(limit).skip((page - 1) * limit)
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

// Get a specific movie details from database storage
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await movieModel.findByMovieDBId(id);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).json({message: 'The movie you requested could not be found.', code: 404});
    }
}));

//From TMDB API
router.get('/tmdb/discover', asyncHandler(async (req, res) => {
    try {
        const page = req.query.page;
        const validation = validatePageNumber(page, 250);
        if (!validation.isValid) {
            return res.status(validation.status).json(validation.json);
        }
        const discoverMovies = await getDiscoverMovies(page);
        res.status(200).json(discoverMovies);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: 'Internal server error.', code: 500});
    }
}));

router.get('/tmdb/upcoming', asyncHandler(async (req, res) => {
    try {
        const page = req.query.page;
        const validation = validatePageNumber(page, 14);
        if (!validation.isValid) {
            return res.status(validation.status).json(validation.json);
        }
        const upcomingMovies = await getUpcomingMovies(page);
        res.status(200).json(upcomingMovies);
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error.', code: 500});
    }
}));

router.get('/tmdb/nowplaying', asyncHandler(async (req, res) => {
    try {
        const page = req.query.page;
        const validation = validatePageNumber(page, 51);
        if (!validation.isValid) {
            return res.status(validation.status).json(validation.json);
        }
        const nowPlayingMovies = await getNowPlayingMovies(page);
        res.status(200).json(nowPlayingMovies);
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error.', code: 500});
    }
}));

router.get('/tmdb/week_trending', asyncHandler(async (req, res) => {
    try {
        const page = req.query.page;
        const validation = validatePageNumber(page, 100);
        if (!validation.isValid) {
            return res.status(validation.status).json(validation.json);
        }
        const weekTrendingMovies = await getWeekTrendingMovies(page);
        res.status(200).json(weekTrendingMovies);
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error.', code: 500});
    }
}));

router.get('/tmdb/:id/recommendations', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const {page} = req.query;
        const validation = validatePageNumber(page, 1);
        if (!validation.isValid) {
            return res.status(validation.status).json(validation.json);
        }
        const recommendationsMoviesList = await getMovieRecommendations(id, page);
        res.status(200).json(recommendationsMoviesList);
    } catch (error) {
        res.status(404).json({success:false, message: 'The recommendations data could not be found for this movie id you requested.', code: 404});
    }
}));

router.get('/tmdb/genres', asyncHandler(async (req, res) => {
    const genresList = await getGenres();
    res.status(200).json(genresList);
}));

router.get('/tmdb/:id/images', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const imagesList = await getMovieImages(id);
        res.status(200).json(imagesList);
    } catch (error) {
        res.status(404).json({success:false, message: 'The images data could not be found for this movie id you requested.', code: 404});
    }
}));

router.get('/tmdb/:id/videos', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const videosList = await getMovieVideos(id);
        res.status(200).json(videosList);
    } catch (error) {
        res.status(404).json({success:false, message: 'The videos data could not be found for this movie id you requested.', code: 404});
    }
}));

router.get('/tmdb/:id/credits', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const creditsList = await getMovieCredits(id);
        res.status(200).json(creditsList);
    } catch (error) {
        res.status(404).json({success:false, message: 'The movie related credits data could not be found for this movie id you requested.', code: 404});
    }
}));

router.get('/tmdb/:id/reviews', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const reviewsList = await getMovieReviews(id);
        res.status(200).json(reviewsList);
    } catch (error) {
        res.status(404).json({success:false, message: 'The reviews data could not be found for this movie id you requested.', code: 404});
    }
}));

router.get('/tmdb/:id', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const movie = await getMovie(id);
        res.status(200).json(movie);
    } catch (error) {
        res.status(404).json({success:false, message: 'The movie details data could not be found for this movie id you requested.', code: 404});
    }
}));

function validatePageNumber(page, maxValidPage) {
    const pageNumber = parseInt(page, 10);
    if (isNaN(pageNumber)) {
        return {
            isValid: false,
            status: 400,
            json: {
                success: false,
                message: 'Page number must be a number.',
                code: 400
            }
        };
    }
    if (pageNumber < 1) {
        return {
            isValid: false,
            status: 400,
            json: {
                success: false,
                message: `Page number cannot be less than 1.`,
                code: 400
            }
        };
    }
    if (pageNumber > maxValidPage) {
        return {
            isValid: false,
            status: 400,
            json: {
                success: false,
                message: `Page number cannot be greater than ${maxValidPage}.`,
                code: 400
            }
        };
    }
    return {isValid: true};
}

export default router;