import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const connect = () => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
    database: 'my_db',
  });

  return connection;
};

const connection = connect();

export default connection;
