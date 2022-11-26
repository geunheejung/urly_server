import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connection from './mysql';

dotenv.config();

const init = () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.listen(process.env.PORT, () => {
    connection.connect();
    console.log(`Listening on port ${process.env.PORT}`);
  });

  return app;
};

export default init;
