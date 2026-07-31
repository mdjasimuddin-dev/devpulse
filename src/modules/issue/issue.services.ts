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

const findAllIssues = async (query: any) => {
  const { sort = 'newest', type, status } = query;

  // dynamic query build
  let sql = `SELECT * FROM issues WHERE 1=1`;
  const values = [];

  if (type) {
    values.push(type);
    sql += ` AND type = $${values.length}`;
  }

  if (status) {
    values.push(status);
    sql += ` AND status = $${values.length}`;
  }

  // sort
  if (sort === 'newest') {
    sql += ` ORDER BY created_at DESC`;
  } else if (sort === 'oldest') {
    sql += ` ORDER BY created_at ASC`;
  }

  // step-1 : find all issue
  const issues = await pool.query(sql, values);

  // step-2 : find reporter by id

  for (const issue of issues.rows) {
    const reporter = await pool.query(
      `
      SELECT id, name, role FROM users WHERE id = $1
      `,
      [issue.reporter_id]
    );

    issue.reporter = reporter.rows[0];

    delete issue.reporter_id;
  }

  // console.log('issues console : ', issues.rows);

  return issues;
};

const singleIssue = async (IssueId: string) => {
  // console.log('Issue single Id : ', IssueId);

  // step-1 : find issues details
  const issues = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [IssueId]
  );

  if (issues.rows.length === 0) {
    throw new Error('Issue not found!');
  }

  // step-2 : find issues reporter by id

  for (const issueInfo of issues.rows) {
    const reporter = await pool.query(
      `
      SELECT id, name, role FROM users WHERE id = $1
      `,
      [issueInfo.reporter_id]
    );

    issueInfo.reporter = reporter.rows[0];

    delete issueInfo.reporter_id;
  }

  return issues;
};

const updateIssues = async (payload: issuesInFace, id: string, userId: string) => {
  // step-1 : find current user
  const user = await pool.query(
    `
      SELECT id, name, email, role FROM users WHERE id=$1
      `,
    [userId]
  );

  if (user.rows.length === 0) {
    throw new Error('User not found');
  }

  // current user
  const currentUser = user.rows[0];

  // step-2 : Issue find
  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );

  // console.log(issue.rows);

  if (issue.rows.length === 0) {
    throw new Error('Issue not found');
  }

  // current issue
  const issueData = issue.rows[0];
  // console.log(issueData);

  // step-3: update query

  if (currentUser.role === 'maintainer') {
    const { title, description, type, status } = payload;

    const updatedIssue = await pool.query(
      `
      UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [title, description, type, status, id]
    );

    console.log('User update successfully', updatedIssue.rows);
  } else if (
    currentUser.role == 'contributor' &&
    issueData.status === 'open' &&
    issueData.reporter_id == currentUser.id
  ) {
    const { title, description, type, status } = payload;

    const updateData = await pool.query(
      `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      status = COALESCE($4, type),
      updated_at = CURRENT_TIMESTAMP
      WHERE id =$5
      RETURNING *
    `,
      [title, description, type, status, id]
    );

    return updateData.rows;
  } else {
    throw new Error('You cannot update this. Your access is limitation.');
  }

  return updateIssues;
};

export const issuesService = { issueCreateIntoDB, findAllIssues, singleIssue, updateIssues };
