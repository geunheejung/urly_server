import { Request, Response } from 'express';
import dotenv from 'dotenv';
import connection from '../init/mysql';
import { getInsertUserQuery } from '../querys/user';

dotenv.config();

export const getUser = async (req: Request, res: Response) => {
  try {
    const QUERY = `SELECT * FROM User`;
    await connection.query(QUERY, (error, rows, fields) => {
      if (error) throw error;

      if (!rows.length)
        res.send({ status: 204, ok: true, data: [], message: 'Not Found' });

      res.send({ status: 200, ok: true, data: rows });
    });
  } catch (error) {
    throw error;
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    await connection.query(
      getInsertUserQuery(req.body),
      (error, rows, fields) => {
        if (error) throw error;
        res.send({ ok: true, status: 200, data: fields });
      }
    );
  } catch (error) {
    throw error;
  }
};
