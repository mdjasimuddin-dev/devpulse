import type { Request, Response } from 'express';
import { issuesService } from './issue.services';
import { issueRoute } from './issue.route';
import sendResponse from '../../utility/sendResponse';

const createIssues = async (req: Request, res: Response) => {
  const userId = req?.user?.id;

  try {
    const result = await issuesService.issueCreateIntoDB(req.body, userId);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Issue created successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Bad request. Something is wrong',
    });
  }
};

const readAllIssues = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    // console.log('Query Data controller : ', query);
    const result = await issuesService.findAllIssues(query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Issues retrived successfully',
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Bad request. Something is wrong',
    });
  }
};

const readSingleIssue = async (req: Request, res: Response) => {
  try {
    const issueId = req.params.id;

    const result = await issuesService.singleIssue(issueId as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Issue retrived successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Bad request. Something is wrong',
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body;
    const id = req.params.id;
    const user_Id = req?.user?.id;

    // console.log('User Id find : ', reqBody, id, user_Id);

    const result = await issuesService.updateIssues(reqBody, id as string, user_Id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Issue updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Bad request. Something is wrong',
      // error: error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;
    const id = req.params.id;

    const result = await issuesService.deleteIssues(userId as string, id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Issue Delete successfully',
      // data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Bad request. Something is wrong',
      error: error,
    });
  }
};

export const issuesController = {
  createIssues,
  readAllIssues,
  readSingleIssue,
  updateIssue,
  deleteIssue,
};
