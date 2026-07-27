import type { Request, Response } from 'express';
import { authService } from './auth.services';

const createUser = async (req: Request, res: Response) => {
  const data = req.body;
  console.log('Request Body Data : ', data);

  try {
    const result = await authService.createUserIntoDB(req.body);

    res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Something is wrong',
      data: error.toString(),
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);

    const { refresh_token } = result;

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    res.status(200).json({
      status: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    res.status(403).json({
      status: false,
      message: 'Unauthorize Access',
      data: error.toString(),
    });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refresh_token;

    const result = await authService.refreshToken(token);

    res.status(200).json({
      status: true,
      message: 'Refresh Token Create successfully.',
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      status: false,
      message: 'Unauthorize access.',
      data: error.toString(),
    });
  }
};

export const authController = { createUser, loginUser, refreshToken };
