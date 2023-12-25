import express from 'express';
import dotenv from 'dotenv';
import loglevel from 'loglevel';
import authenticate from './authenticate';
import peopleRouter from './api/people';
import moviesRouter from './api/movies';
import favoritesRouter from './api/favorites';
import cors from 'cors';
import usersRouter from './api/users';
import userUpdateRouter from './api/users/updateUser';
import userDeleteRouter from './api/users/deleteUser';
import reviewsRouter from './api/reviews';
import './seedData'
import './db';
import defaultErrHandler from './errHandler';

if (process.env.NODE_ENV === 'test') {
    loglevel.setLevel('warn')
} else {
    loglevel.setLevel('info')
}

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/user/update', authenticate, userUpdateRouter);
app.use('/api/user/delete', authenticate, userDeleteRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/people', peopleRouter);
app.use('/api/reviews', authenticate, reviewsRouter);
app.use('/api/favorites', authenticate, favoritesRouter);
app.use(defaultErrHandler);

let server = app.listen(port, () => {
    loglevel.info(`Server running at ${port}`);
});
module.exports = server