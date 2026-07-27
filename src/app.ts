import cookieParser from 'cookie-parser';
import express, { type Request, type Response } from 'express';
import { authRoute } from './modules/auth/auth.route';

const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'DevPulse Server Start',
    author: 'Md Jasim Uddin',
  });
});

app.use('/api/auth', authRoute);

export default app;
