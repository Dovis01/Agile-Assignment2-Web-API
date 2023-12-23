import express from 'express';
import dotenv from 'dotenv';
import loglevel from 'loglevel';
import authenticate from './authenticate';
import moviesRouter from './api/movies';
import cors from 'cors';
import usersRouter from './api/users';
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
app.use(express.json());
app.use('/api/users', usersRouter);
//app.use('/api/movies', authenticate,  moviesRouter);
app.use('/api/movies', moviesRouter);
app.use(defaultErrHandler);

let server = app.listen(port, () => {
    loglevel.info(`Server running at ${port}`);
});
module.exports = server