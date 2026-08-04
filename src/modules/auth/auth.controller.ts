import type { Request, Response } from 'express';
import { authService } from './auth.services';
import sendResponse from '../../utility/sendResponse';

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserIntoDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User registered successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Bad request. try again latter',
      data: error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);

    const { token } = result;

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 201,
      success: false,
      message: 'Unauthorize Access',
    });
  }
};

// const refreshToken = async (req: Request, res: Response) => {
//   try {
//     const token = req.cookies.refresh_token;

//     const result = await authService.refreshToken(token);

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: 'Refresh Token Generate Successfully.',
//       data: result,
//     });
//   } catch (error: any) {
//     sendResponse(res, {
//       statusCode: 400,
//       success: false,
//       message: 'Bad request, try again later.',
//     });
//   }
// };

export const authController = { createUser, loginUser };
