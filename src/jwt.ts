import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IUserSchema } from '../../types/api';
import redisCli from './redis';

dotenv.config();

export interface ITokenPayload {
  id: string;
  error?: string;
}

const getToken = (authorization: string) => authorization.split('Bearer ')[1];

const secret = process.env.SECRET as string;

const sign = (user: IUserSchema) => {
  try {
    const payload = { id: user.user_id.toString() };

    const accessToken = jwt.sign(payload, secret, {
      expiresIn: '30m',
    });

    return accessToken;
  } catch (error) {
    throw `[jwt-sign ERROR] -> ${error}`;
  }
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
    // refresh token을 생성 시 토대가 되는 id를 redis에 저장해둠. [id]: refrehtoken
    const registeredRefreshToken = await redisCli.get(id);
    // redis에 저장된 refresh token과 검증하려는 token이 동일할 경우 검증 완료
    if (registeredRefreshToken !== refreshToken) return false;

    // 1차적으로 redis에 등록된것을 확인했으면 2차적으로 token자체가 유효한지 검증.
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      secret
    ) as ITokenPayload;

    return decodedRefreshToken;
  } catch (error: any) {
    return false;
  }
};

export { getToken, sign, refresh, verify, refreshVerify };
