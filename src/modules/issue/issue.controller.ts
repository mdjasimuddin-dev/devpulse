import type { Request, Response } from 'express';
import { issuesService } from './issue.services';

const createIssues = async (req: Request, res: Response) => {
  const userId = req?.user?.id;

  try {
    const result = await issuesService.issueCreateIntoDB(req.body, userId);
    res.status(201).json({
      status: true,
      message: 'Issue created successfully',
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

export const issuesController = { createIssues };
