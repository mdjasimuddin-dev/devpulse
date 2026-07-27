import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../../database/db.index';
import type { Iuser } from './user-register.interface';
import config from '../../config/config.index';

const createUserIntoDB = async (payload: Iuser) => {
  console.log('Payload Data :', payload);
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);
  console.log('Hash Password :', hashPassword);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );

  // console.log('user service : ', result);

  const user = result.rows[0];

  delete user.password;

  return result;
};

const loginUser = async (reqBody: { email: string; password: string }) => {
  const { email, password } = reqBody;

  // step-01 is Exists user into DB?

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
    `,
    [email]
  );

  if (userData.rows.length === 0) {
    throw new Error('Invalid Credentials');
  }

  // step-2 if user exists then matching the user password

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error('Invalid Credentials');
  }

  // step-3 if matching the password then create a token

  const payload = {
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  };

  // create accessToken
  const accessToken = jwt.sign(payload, config.token_secret as string, {
    expiresIn: '15min',
  });

  // create accessToken
  const refreshToken = jwt.sign(payload, config.refresh_token_secret as string, {
    expiresIn: '15min',
  });

  return { accessToken, refreshToken };
};

export const authService = { createUserIntoDB, loginUser };
