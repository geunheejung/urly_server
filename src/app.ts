import { Request, Response } from 'express';
import initExpress from './init/express';
import {
  getUser,
  createUser,
  checkExists,
  login,
  loggout,
} from './routes/user';
import { refresh } from './routes/auth';
import { authJWT } from './middleware/authJwt';
import dotenv from 'dotenv';

dotenv.config();

const app = initExpress();

app.get('/user/:id?', authJWT, getUser);
app.post('/user', createUser);
app.post('/user/exists-check', checkExists);
app.post('/user/login', login);
app.post('/user/loggout', loggout);
app.post('/user/refresh', refresh);
