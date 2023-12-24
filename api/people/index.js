import peopleModel from './peopleModel';
import {
    getPeopleImages, getPeopleMovieCredits, getPeopleTVCredits,
    getPopularPeople, getPopularPeopleDetail, getWeekTrendingPeople,
} from '../tmdb-api';
import asyncHandler from 'express-async-handler';
import express from 'express';

const router = express.Router();

// Get all people data from database storage
router.get('/', asyncHandler(async (req, res) => {
    let {page = 1, limit = 2} = req.query; // destructure page and limit and set default values
    [page, limit] = [+page, +limit]; //trick to convert to numeric (req.query will contain string values)

    // Parallel execution of counting movies and getting movies using peopleModel
    const [total_results, results] = await Promise.all([
        peopleModel.estimatedDocumentCount(),
        peopleModel.find().limit(limit).skip((page - 1) * limit)
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

// Get some people details from database storage
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const person = await peopleModel.findByPeopleId(id);
    if (person) {
        res.status(200).json(person);
    } else {
        res.status(404).json({message: 'The people you requested could not be found.', code: 404});
    }
}));


/**
 * From TMDB API
 * */
router.get('/tmdb/popular_people', asyncHandler(async (req, res) => {
    try {
        const {page} = req.query;
        const validation = validatePageNumber(page, 250);
        if (!validation.isValid) {
            return res.status(validation.status).json(validation.json);
        }
        const popularPeople = await getPopularPeople(page);
        res.status(200).json(popularPeople);
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error.', code: 500});
    }
}));

router.get('/tmdb/week_trending', asyncHandler(async (req, res) => {
    try {
        const {page} = req.query;
        const validation = validatePageNumber(page, 250);
        if (!validation.isValid) {
            return res.status(validation.status).json(validation.json);
        }
        const weekTrendingPeople = await getWeekTrendingPeople(page);
        res.status(200).json(weekTrendingPeople);
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error.', code: 500});
    }
}));

router.get('/tmdb/:id', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const person = await getPopularPeopleDetail(id);
        res.status(200).json(person);
    } catch (error) {
        res.status(404).json({success:false, message: 'The specific person details data could not be found for this person id you requested.', code: 404});
    }
}));

router.get('/tmdb/:id/images', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const imagesList = await getPeopleImages(id);
        res.status(200).json(imagesList);
    } catch (error) {
        res.status(404).json({success:false, message: 'The specific person images data could not be found for this person id you requested.', code: 404});
    }
}));

router.get('/tmdb/:id/movie_credits', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const movieCreditsList = await getPeopleMovieCredits(id);
        res.status(200).json(movieCreditsList);
    } catch (error) {
        res.status(404).json({success:false, message: "The specific person's related movie credits data could not be found for this person id you requested.", code: 404});
    }
}));

router.get('/tmdb/:id/tv_credits', asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const tvCreditsList = await getPeopleTVCredits(id);
        res.status(200).json(tvCreditsList);
    } catch (error) {
        res.status(404).json({success:false, message: "The specific person's related tv credits data could not be found for this person id you requested.", code: 404});
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