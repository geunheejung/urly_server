import initExpress from './init/express';
import { getUser, createUser } from './routes/user';

const app = initExpress();

app.get('/user', getUser);
app.post('/user', createUser);
