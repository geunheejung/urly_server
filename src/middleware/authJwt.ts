import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../api';
import { getToken, verify } from '../jwt';

export const authJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      headers: { authorization },
    } = req;
    if (!authorization) throw 'No authorization';

    const accessToken = getToken(authorization);
    const decoded = verify(accessToken);

    if (decoded.error === 'jwt expired') throw 'jwt expired';

    if (!decoded.id) throw 'No decoded.id';

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.send(ApiResponse.unauthorized(error as string));
  }
};
