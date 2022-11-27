import initExpress from './init/express';
import { getUser, createUser, checkExists } from './routes/user';

const app = initExpress();

app.get('/user/:id?', getUser);
app.post('/user', createUser);
app.post('/user/exists-check', checkExists);
