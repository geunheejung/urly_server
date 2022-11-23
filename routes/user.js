import connection from '../initMysql.js';

export const getUser = async (req, res) => {
  try {
    await connection.connect();
    const QUERY = `SELECT * FROM Users`;
    const rows = await connection.query(QUERY, (error, rows, fields) => {
      if (error) throw error;
      res.send(rows);
    });
    await connection.end();
  } catch (error) {
    console.log('ERROR -->', error);
    throw error;
  }
};
