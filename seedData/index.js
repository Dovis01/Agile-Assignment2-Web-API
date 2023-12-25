import userModel from '../api/users/userModel';
import users from './users';
import dotenv from 'dotenv';
import movieModel from '../api/movies/movieModel';
import movies from './movies';
import peopleModel from '../api/people/peopleModel';
import people from './people';
import reviewModel from '../api/reviews/reviewModel';
import reviews from './reviews';
import favoriteModel from '../api/favorites/favoriteModel';
import favorites from './favorites';
import toWatchListModel from '../api/toWatchList/toWatchListModel';
import toWatchList from './toWatchList';

dotenv.config();

// deletes all user documents in collection and inserts test data
async function loadUsers() {
    try {
        await userModel.deleteMany();
        await users.forEach(user => userModel.create(user));
    } catch (err) {
        console.error(`failed to Load user Data: ${err}`);
    }
}

// deletes all movies documents in collection and inserts test data
export async function loadMovies() {
    try {
        await movieModel.deleteMany();
        await movieModel.collection.insertMany(movies);
    } catch (err) {
        console.error(`failed to Load movie Data: ${err}`);
    }
}

// deletes all people documents in collection and inserts test data
export async function loadPeople() {
    try {
        await peopleModel.deleteMany();
        await peopleModel.collection.insertMany(people);
    } catch (err) {
        console.error(`failed to Load people Data: ${err}`);
    }
}

export async function loadReviews() {
    try {
        await reviewModel.deleteMany();
        await reviewModel.collection.insertMany(reviews);
    } catch (err) {
        console.error(`failed to Load reviews Data: ${err}`);
    }
}

export async function loadFavorites() {
    try {
        await favoriteModel.deleteMany();
        await favoriteModel.collection.insertMany(favorites);
    } catch (err) {
        console.error(`failed to Load favorites Data: ${err}`);
    }
}

export async function loadToWatchList() {
    try {
        await toWatchListModel.deleteMany();
        await toWatchListModel.collection.insertMany(toWatchList);
    } catch (err) {
        console.error(`failed to Load toWatchList Data: ${err}`);
    }
}

if (process.env.SEED_DB === 'true') {
    loadUsers();
    loadMovies();//ADD THIS LINE
    loadPeople();
    loadReviews();
    loadFavorites();
    loadToWatchList();
}