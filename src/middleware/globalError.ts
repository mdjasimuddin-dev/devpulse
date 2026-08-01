import type { NextFunction, Request, Response } from 'express';

const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error.stack); // Log the error

  res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    errors: error,
  });
};

export default globalErrorHandler;
