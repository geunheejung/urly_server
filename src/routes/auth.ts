import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { IUser, IUserSchema } from '../../../types/api';
import { ApiResponse } from '../api';
import connection from '../init/mysql';
import { getToken, refreshVerify, verify, sign, ITokenPayload } from '../jwt';
import redisCli from '../redis';

export const refresh = async (req: Request, res: Response) => {
  const {
    headers: { authorization },
    cookies: { refresh_token: refresh },
  } = req;
  try {
    // access token 또는 refresh token이 헤더에 없는 경우
    if (!(authorization && refresh))
      return res.send(
        ApiResponse.badRequest(
          false,
          'Access token and refresh token are need for refresh.'
        )
      );

    const accessToken = getToken(authorization);
    const verifiedAccess = verify(accessToken);

    const refreshToken = refresh as string;

    const decodedAccessToken = (await jwt.decode(accessToken)) as ITokenPayload;

    // jwt.decoded는 jwt가 만료되어도 토큰을 디코딩함. 즉 token의 형식이 아닐 경우를 체크
    if (decodedAccessToken === null)
      return res.send(ApiResponse.unauthorized());

    // access token의 decoding 된 값에서 유저의 id를 가져와 refresh token을 검증.
    const decodedRefreshToken = await refreshVerify(
      refreshToken,
      decodedAccessToken.id
    );

    // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없음.
    if (verifiedAccess.error !== 'jwt expired') {
      return res.send(
        ApiResponse.badRequest(false, 'Access token is not expired.')
      );
    }

    // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인.
    if (!decodedRefreshToken)
      return res.send(ApiResponse.unauthorized('Please Again Login'));

    // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새 access token 발급.
    connection.query(
      `SELECT * FROM User WHERE id='${decodedRefreshToken.id}'`,
      (error, rows: IUserSchema[], field) => {
        try {
          const [user] = rows;

          const newAccessToken = sign(user);

          return res.send(
            new ApiResponse(StatusCodes.OK, 'refresh access token', {
              accessToken: newAccessToken,
              refreshToken,
            })
          );
        } catch (error) {
          throw error;
        }
      }
    );
  } catch (error) {
    res.send(ApiResponse.badRequest());
  }
};
