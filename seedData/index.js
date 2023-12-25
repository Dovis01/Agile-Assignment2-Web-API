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
    console.log('load users Data');
    try {
        await userModel.deleteMany();
        await users.forEach(user => userModel.create(user));
        console.info(`${users.length} users were successfully stored.`);
    } catch (err) {
        console.error(`failed to Load user Data: ${err}`);
    }
}

// deletes all movies documents in collection and inserts test data
export async function loadMovies() {
    console.log('load movies data');
    try {
        await movieModel.deleteMany();
        await movieModel.collection.insertMany(movies);
        console.info(`${movies.length} Movies were successfully stored.`);
    } catch (err) {
        console.error(`failed to Load movie Data: ${err}`);
    }
}

// deletes all people documents in collection and inserts test data
export async function loadPeople() {
    console.log('load people data');
    try {
        await peopleModel.deleteMany();
        await peopleModel.collection.insertMany(people);
        console.info(`${people.length} People were successfully stored.`);
    } catch (err) {
        console.error(`failed to Load people Data: ${err}`);
    }
}

export async function loadReviews() {
    console.log('load reviews data');
    try {
        await reviewModel.deleteMany();
        await reviewModel.collection.insertMany(reviews);
        console.info(`${reviews.length} Reviews were successfully stored.`);
    } catch (err) {
        console.error(`failed to Load reviews Data: ${err}`);
    }
}

export async function loadFavorites() {
    console.log('load favorites data');
    try {
        await favoriteModel.deleteMany();
        await favoriteModel.collection.insertMany(favorites);
        console.info(`${favorites.length} Favorites were successfully stored.`);
    } catch (err) {
        console.error(`failed to Load favorites Data: ${err}`);
    }
}

export async function loadToWatchList() {
    console.log('load toWatchList data');
    try {
        await toWatchListModel.deleteMany();
        await toWatchListModel.collection.insertMany(toWatchList);
        console.info(`${toWatchList.length} ToWatchList were successfully stored.`);
    } catch (err) {
        console.error(`failed to Load toWatchList Data: ${err}`);
    }
}

if (process.env.NODE_ENV === 'development') {
    loadUsers();
    loadMovies();//ADD THIS LINE
    loadPeople();
    loadReviews();
    loadFavorites();
    loadToWatchList();
}