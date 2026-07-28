import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import config from '../config/config.index';
import { pool } from '../database/db.index';

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      // step-01 : check token
      if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorize access!' });
      }

      // Step-02 : if have decode token
      const decoded = jwt.verify(token as string, config.token_secret as string) as JwtPayload;

      // step-03 : find your by token email
      const userData = await pool.query(
        `
      SELECT * FROM users WHERE email=$1
      `,
        [decoded.email]
      );

      if (userData.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found!' });
      }

      const user = userData.rows[0];

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      // step-04 : check role
      // const roles = ['contributor', 'maintainer'];

      if (roles?.length && !roles.includes(user?.role)) {
        res.status(403).json({
          success: false,
          message: 'Forbidden!!,This role have no access!',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
