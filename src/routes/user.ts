import { Request, Response } from 'express';
import dotenv from 'dotenv';
import _pick from 'lodash/pick';
import { StatusCodes } from 'http-status-codes';
import connection from '../init/mysql';
import { getInsertUserQuery } from '../querys/user';
import {
  IUser,
  TypedRequestBody,
  ICheckExistsPayload,
} from '../../../types/api';
import { ApiResponse } from '../api';

dotenv.config();

const pickUser = (user: IUser[]) =>
  user.map((field) =>
    _pick(field, ['id', 'name', 'phone', 'address', 'detailAddress'])
  );
export const getUser = async (req: Request, res: Response) => {
  try {
    const {
      params: { id },
    } = req;
    const query = `SELECT * FROM User`;
    const where = `WHERE user_id = ${id}`;
    await connection.query(
      id ? `${query} ${where}` : query,
      (error, rows: IUser[], fields) => {
        try {
          if (error || !rows.length)
            return res.send(
              new ApiResponse(
                StatusCodes.NO_CONTENT,
                '유저를 찾지 못했습니다.',
                []
              )
            );

          const user = pickUser(rows);

          res.send(new ApiResponse(StatusCodes.OK, '유저 조회 완료.', user));
        } catch (error) {
          throw error;
        }
      }
    );
  } catch (error) {
    res.send(
      new ApiResponse(StatusCodes.BAD_REQUEST, '다시 요청 해주세요.', [])
    );
  }
};

export const createUser = async (
  req: TypedRequestBody<IUser>,
  res: Response
) => {
  try {
    await connection.query(
      getInsertUserQuery(req.body),
      (error, rows, fields) => {
        if (error) throw error;
        res.send(
          new ApiResponse(StatusCodes.CREATED, '유저를 추가 했습니다.', fields)
        );
      }
    );
  } catch (error) {
    res.send({
      status: StatusCodes.BAD_REQUEST,
      message: '유저를 추가하지 못했습니다.',
    });
  }
};

// 유저 중복체크(id, email)
export const checkExists = async (
  req: TypedRequestBody<ICheckExistsPayload>,
  res: Response
) => {
  try {
    const {
      body: { value, field },
    } = req;
    const query = `SELECT * FROM User WHERE ${field} LIKE '%${value}%'`;

    await connection.query(query, (error, rows, fields) => {
      if (error) {
        return res.send(
          new ApiResponse(StatusCodes.BAD_REQUEST, '이미 존재합니다.', true)
        );
      }

      if (rows.length)
        return res.send(
          new ApiResponse(StatusCodes.OK, '이미 존재합니다.', true)
        );

      res.send(new ApiResponse(StatusCodes.OK, '사용 가능합니다.', false));
    });
  } catch (error) {
    res.send(
      new ApiResponse(StatusCodes.BAD_REQUEST, '다시 요청해주세요.', true)
    );
  }
};
