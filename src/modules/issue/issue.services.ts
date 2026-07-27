import type { Request, Response } from 'express';
import type { issuesInFace } from './issue.interface';
import { pool } from '../../database/db.index';

const issueCreateIntoDB = async (reqBody: issuesInFace, userId: number) => {
  const { title, description, type, status } = reqBody;

  const issues = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [title, description, type, status || 'open', userId]
  );

  return issues;
};

export const issuesService = { issueCreateIntoDB };
