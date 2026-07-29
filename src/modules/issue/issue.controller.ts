import type { Request, Response } from 'express';
import { issuesService } from './issue.services';
import { issueRoute } from './issue.route';

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

const readAllIssues = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    // console.log('Query Data controller : ', query);
    const result = await issuesService.findAllIssues(query);

    res.status(200).json({
      status: true,
      message: 'Issues retrived successfully',
      data: result.rows,
    });
  } catch (error: any) {
    // console.log(error);
    res.status(400).json({
      status: false,
      message: 'Something is wrong!',
    });
  }
};

const readSingleIssue = async (req: Request, res: Response) => {
  try {
    const issueId = req.params.id;

    const result = await issuesService.singleIssue(issueId as string);

    res.status(200).json({
      status: true,
      message: 'Issue retrived successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Something is wrong!',
      error: error.toString(),
    });
  }
};

export const issuesController = { createIssues, readAllIssues, readSingleIssue };
