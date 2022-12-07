import { Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import _pick from 'lodash/pick';
import { StatusCodes } from 'http-status-codes';
import connection from '../init/mysql';
import { getInsertUserQuery } from '../querys/user';
import {
  IUser,
  TypedRequestBody,
  ICheckExistsPayload,
  ILoginPayload,
} from '../../../types/api';
import { ApiResponse } from '../api';
import { getToken, ITokenPayload, refresh, sign } from '../jwt';
import redisCli from '../redis';

dotenv.config();

const pickUser = (user: IUser[]) =>
  user.map((field) =>
    _pick(field, ['user_id', 'id', 'name', 'phone', 'address', 'detailAddress'])
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
          if (error) throw error;
          if (!rows.length)
            return res.send(
              new ApiResponse(
                StatusCodes.NO_CONTENT,
                '유저를 찾지 못했습니다.',
                []
              )
            );

          const user = pickUser(rows);

          const data = user.length === 1 ? user[0] : user;

          res.send(new ApiResponse(StatusCodes.OK, '유저 조회 완료.', data));
        } catch (error) {
          throw error;
        }
      }
    );
  } catch (error) {
    res.send(ApiResponse.badRequest([]));
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
    res.send(ApiResponse.badRequest());
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
      if (error) throw error;

      if (rows.length)
        return res.send(
          new ApiResponse(StatusCodes.OK, '이미 존재합니다.', true)
        );

      res.send(new ApiResponse(StatusCodes.OK, '사용 가능합니다.', false));
    });
  } catch (error) {
    res.send(ApiResponse.badRequest());
  }
};

export const login = async (
  req: TypedRequestBody<ILoginPayload>,
  res: Response
) => {
  /** Login Flow
   * 1. id, pw 를 req.body 로 받음.
   * 비밀번호 생성할 때 만든 암호화 key는 서버, 클라이언트 공유
   * 2. 암호화된 password를 복호화한다.
   * 3. DB에서 id, pw를 조회한다.
   * 3.1 False -> 로그인 실패
   * 4. id를 value로 Access token을 생성한다.
   * 5. id를 value로 Refresh token을 생성한다.
   * 6. (user 정보, access token, refresh token) 을 반환한다.
   */

  try {
    const {
      body: { id, password },
    } = req;
    // const query = `SELECT * FROM User WHERE  LIKE '%${value}%'`;
    const query = `SELECT * FROM User WHERE id = '${id}' AND password = '${password}'`;

    await connection.query(query, async (error, rows, fields) => {
      const isLogin = !!rows.length;
      if (!isLogin)
        return res.send(
          new ApiResponse(
            StatusCodes.UNAUTHORIZED,
            '비밀번호가 틀렸습니다.',
            {}
          )
        );

      const [user] = rows;

      const accessToken = await sign(user);
      const refreshToken = await refresh();

      // 발급한 refresh token을 redis에 key를 user의 id로 하여 저장.
      redisCli.set(user.id, refreshToken);

      // client에게 토큰 모두를 반환.
      res.send(
        new ApiResponse(StatusCodes.OK, '로그인 되었습니다.', {
          accessToken,
          refreshToken,
        })
      );
    });
  } catch (error) {
    res.send(ApiResponse.badRequest({}));
  }
};

export const loggout = async (req: Request, res: Response) => {
  try {
    const {
      headers: { authorization },
    } = req;
    if (!authorization) return res.send(ApiResponse.unauthorized());

    const accessToken = getToken(authorization);
    const { id } = jwt.decode(accessToken) as ITokenPayload;

    const isExists = await redisCli.exists(id);

    if (isExists) await redisCli.del(id);

    res.send(new ApiResponse(StatusCodes.OK, 'loggout', true));
    // redis에 등록된 refresh token 삭제
  } catch (error) {
    console.log(error);

    res.send(ApiResponse.badRequest());
  }
};
