import jwt from 'jsonwebtoken';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { IUser } from '../../types/api';
import { ApiResponse } from './api';
import { StatusCodes } from 'http-status-codes';
import redisCli from './redis';

dotenv.config();

interface ITokenPayload {
  id: string;
}

const getToken = (authorization: string) => authorization.split('Bearer ')[1];

const secret = process.env.SECRET as string;

const sign = (user: IUser) => {
  const payload = { id: user.id };

  const accessToken = jwt.sign(payload, secret);

  return accessToken;
};

const refresh = () => {
  const refreshToken = jwt.sign({}, secret, {
    algorithm: 'HS256',
    expiresIn: '14d',
  });

  return refreshToken;
};

const verify = (token: string) => {
  try {
    const decoded = jwt.verify(token, secret) as ITokenPayload;
    return {
      ok: true,
      id: decoded.id,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
};

const refreshVerify = async (refreshToken: string, id: string) => {
  try {
    const registeredRefreshToken = await redisCli.get(id);
    if (registeredRefreshToken !== refreshToken) false;

    const decodedRefreshToken = jwt.verify(
      refreshToken,
      secret
    ) as ITokenPayload;
    return decodedRefreshToken;
  } catch (error: any) {
    return false;
  }
};

const authJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      headers: { authorization },
    } = req;
    if (!authorization) throw StatusCodes.UNAUTHORIZED;

    const accessToken = getToken(authorization);
    const decoded = verify(accessToken);

    if (!decoded.id) throw StatusCodes.UNAUTHORIZED;

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.send(
      new ApiResponse(StatusCodes.UNAUTHORIZED, '다시 요청해주세요', false)
    );
  }
};

export { getToken, sign, refresh, verify, refreshVerify, authJWT };