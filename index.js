import express from 'express';
import dotenv from 'dotenv';
import authenticate from './authenticate';
import moviesRouter from './api/movies';
import cors from 'cors';
import usersRouter from './api/users';
import './seedData'
import './db';
import defaultErrHandler from './errHandler';

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
    console.info(`Server running at ${port}`);
});
module.exports = server