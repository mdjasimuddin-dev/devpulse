import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  

// src/app.ts
import cookieParser from "cookie-parser";
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.services.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// src/database/db.index.ts
import { Pool } from "pg";

// src/config/config.index.ts
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config = {
  server_port: process.env.SERVER_PORT,
  connection_string: process.env.DB_CONNECTION_STRING,
  token_secret: process.env.TOKEN_SECRET_KEY,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET_KEY
};
var config_index_default = config;

// src/database/db.index.ts
var pool = new Pool({
  connectionString: config_index_default.connection_string
});
var connectDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(20),
    email VARCHAR(20) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'contributor',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    
    )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(15) NOT NULL,
      status VARCHAR(10) DEFAULT 'open',
      reporter_id INT REFERENCES users(id) ON DELETE CASCADE,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("Database Connected Successfully.");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.services.ts
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  const user = result.rows[0];
  delete user.password;
  return result;
};
var loginUser = async (reqBody) => {
  const { email, password } = reqBody;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt.sign(payload, config_index_default.token_secret, {
    expiresIn: "1d"
  });
  const refreshToken3 = jwt.sign(payload, config_index_default.refresh_token_secret, {
    expiresIn: "30d"
  });
  const token = { token: accessToken, refresh_token: refreshToken3, user };
  delete user.password;
  return token;
};
var refreshToken = async (refreshToken3) => {
  const token = refreshToken3;
  if (!token) {
    throw new Error("Unauthorize access");
  }
  const decoded = await jwt.verify(token, config_index_default.refresh_token_secret);
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
    `,
    [decoded.email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found!");
  }
  const user = userData.rows[0];
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt.sign(payload, config_index_default.token_secret, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = { createUserIntoDB, loginUser, refreshToken };

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await authService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Bad request. try again latter",
      data: error
    });
  }
};
var loginUser2 = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    const { refresh_token } = result;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 201,
      success: false,
      message: "Unauthorize Access"
    });
  }
};
var refreshToken2 = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    const result = await authService.refreshToken(token);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Refresh Token Generate Successfully.",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Bad request, try again later."
    });
  }
};
var authController = { createUser, loginUser: loginUser2, refreshToken: refreshToken2 };

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
var authRoute = router;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.services.ts
var issueCreateIntoDB = async (reqBody, userId) => {
  const { title, description, type, status } = reqBody;
  const issues = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [title, description, type, status || "open", userId]
  );
  return issues;
};
var findAllIssues = async (query) => {
  const { sort = "newest", type, status } = query;
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
  if (sort === "newest") {
    sql += ` ORDER BY created_at DESC`;
  } else if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  }
  const issues = await pool.query(sql, values);
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
  return issues;
};
var singleIssue = async (IssueId) => {
  const issues = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [IssueId]
  );
  if (issues.rows.length === 0) {
    throw new Error("Issue not found!");
  }
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
var updateIssues = async (payload, id, userId) => {
  const user = await pool.query(
    `
      SELECT id, name, email, role FROM users WHERE id=$1
      `,
    [userId]
  );
  if (user.rows.length === 0) {
    throw new Error("User not found");
  }
  const currentUser = user.rows[0];
  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  if (issue.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issueData = issue.rows[0];
  if (currentUser.role === "maintainer") {
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
    console.log("User update successfully", updatedIssue.rows);
  } else if (currentUser.role == "contributor" && issueData.status === "open" && issueData.reporter_id == currentUser.id) {
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
    throw new Error("You cannot update this. Your access is limitation.");
  }
  return updateIssues;
};
var deleteIssues = async (userId, id) => {
  const userInfo = await pool.query(
    `
      SELECT id, name, role FROM users WHERE id = $1
      `,
    [userId]
  );
  if (userInfo.rows.length === 0) {
    throw new Error("User not found");
  }
  const issues = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  if (issues.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const role = userInfo.rows[0].role;
  if (role !== "maintainer") {
    throw new Error("Only maintainer can delete issues");
  }
  const deletedItem = await pool.query(
    `
    DELETE FROM issues WHERE id =$1
    RETURNING *
    `,
    [id]
  );
  if (deletedItem.rows.length === 0) {
    throw new Error("Issue not found");
  }
  console.log("Deleted Item :", deletedItem.rows);
  return deletedItem.rows[0];
};
var issuesService = {
  issueCreateIntoDB,
  findAllIssues,
  singleIssue,
  updateIssues,
  deleteIssues
};

// src/modules/issue/issue.controller.ts
var createIssues = async (req, res) => {
  const userId = req?.user?.id;
  try {
    const result = await issuesService.issueCreateIntoDB(req.body, userId);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Bad request. Something is wrong"
    });
  }
};
var readAllIssues = async (req, res) => {
  try {
    const query = req.query;
    const result = await issuesService.findAllIssues(query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Bad request. Something is wrong"
    });
  }
};
var readSingleIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const result = await issuesService.singleIssue(issueId);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Bad request. Something is wrong"
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const reqBody = req.body;
    const id = req.params.id;
    const user_Id = req?.user?.id;
    const result = await issuesService.updateIssues(reqBody, id, user_Id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue update successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Bad request. Something is wrong",
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const id = req.params.id;
    const result = await issuesService.deleteIssues(userId, id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue Delete successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: "Bad request. Something is wrong",
      error
    });
  }
};
var issuesController = {
  createIssues,
  readAllIssues,
  readSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/middleware.index.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorize access!" });
      }
      const decoded = jwt2.verify(token, config_index_default.token_secret);
      const userData = await pool.query(
        `
      SELECT * FROM users WHERE email=$1
      `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found!" });
      }
      const user = userData.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      if (roles?.length && !roles.includes(user?.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden!!,This role have no access!"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var middleware_index_default = auth;

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", middleware_index_default("maintainer", "contributor"), issuesController.createIssues);
router2.get("/", issuesController.readAllIssues);
router2.get("/:id", issuesController.readSingleIssue);
router2.patch("/:id", middleware_index_default("contributor", "maintainer"), issuesController.updateIssue);
router2.delete("/:id", middleware_index_default("maintainer"), issuesController.deleteIssue);
var issueRoute2 = router2;

// src/app.ts
import "cors";

// src/middleware/globalError.ts
var globalErrorHandler = (error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
    errors: error
  });
};
var globalError_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse Server Start",
    author: "Md Jasim Uddin"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute2);
app.use(globalError_default);
var app_default = app;

// src/server.ts
var main = () => {
  connectDB();
  app_default.listen(config_index_default.server_port, () => {
    console.log(`Server Running Port is : ${config_index_default.server_port}`);
  });
};
main();
//# sourceMappingURL=server.js.map