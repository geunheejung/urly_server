import { getUser } from './routes/user.js';
import init from './init/express.js';

const app = init();

app.get('/', (req, res) => {
  res.send('root');
});

app.get('/user', getUser);
