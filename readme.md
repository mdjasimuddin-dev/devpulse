# 🚼 DevPulse – Internal Tech Issue & Feature Tracker

DevPulse is a collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions efficiently. It provides a robust backend API with secure role-based access control.

🔗 **Live API URL:** [https://dev-pulse-one-sage.vercel.app](https://dev-pulse-one-sage.vercel.app) _
🔗 **Github Project URL:** [https://github.com/mdjasimuddin-dev/devpulse.git](https://github.com/mdjasimuddin-dev/devpulse.git) _

## ✨ Features

- **Role-Based Access Control (RBAC):** Distinct permissions for `contributor` and `maintainer` roles.
- **Secure Authentication:** JWT-based stateless authentication with securely hashed passwords using bcrypt.
- **Issue Management:** Complete CRUD operations for tracking bugs and feature requests.
- **Raw SQL Database:** Directly communicates with PostgreSQL using the native `pg` driver without any ORMs or query builders (No SQL JOINs used).
- **Modular Architecture:** Clean, scalable, and maintainable Express.js application structure using strict TypeScript.
- **Custom Error Handling:** Centralized error handling for smooth sync and async error catching.

## 🛠️ Technology Stack

- **Runtime:** Node.js LTS (24.x or higher)
- **Language:** TypeScript
- **Framework:** Express.js (Modular router architecture)
- **Database:** PostgreSQL (Native `pg` driver, Raw SQL only)
- **Security:** `bcrypt` (Password hashing), `jsonwebtoken` (JWT standard)

## 🗄️ Database Schema Summary

### `users` Table

| Field        | Type       | Description                                            |
| :----------- | :--------- | :----------------------------------------------------- |
| `id`         | Serial/Int | Auto-incrementing unique identifier (Primary Key)      |
| `name`       | String     | Full display name of the user                          |
| `email`      | String     | Unique login address                                   |
| `password`   | String     | Securely encrypted password hash (Hidden in responses) |
| `role`       | String     | System access level (`contributor` or `maintainer`)    |
| `created_at` | Timestamp  | Account creation time                                  |
| `updated_at` | Timestamp  | Last update time                                       |

### `issues` Table

| Field         | Type       | Description                                          |
| :------------ | :--------- | :--------------------------------------------------- |
| `id`          | Serial/Int | Auto-incrementing unique identifier (Primary Key)    |
| `title`       | String     | Short descriptive headline (Max: 150 chars)          |
| `description` | Text       | Detailed explanation (Min: 20 chars)                 |
| `type`        | String     | Category: `bug` or `feature_request`                 |
| `status`      | String     | Workflow state: `open`, `in_progress`, or `resolved` |
| `reporter_id` | Int        | References user ID (No foreign key constraints)      |
| `created_at`  | Timestamp  | Issue creation time                                  |
| `updated_at`  | Timestamp  | Last update time                                     |

## 🌐 API Endpoints

### Authentication

| Method | Endpoint           | Access | Description                                         |
| :----- | :----------------- | :----- | :-------------------------------------------------- |
| `POST` | `/api/auth/signup` | Public | Register a new user (`contributor` or `maintainer`) |
| `POST` | `/api/auth/login`  | Public | Authenticate user and receive JWT token             |

### Issues

| Method   | Endpoint          | Access                   | Description                                                       |
| :------- | :---------------- | :----------------------- | :---------------------------------------------------------------- |
| `POST`   | `/api/issues`     | Authenticated            | Create a new bug report or feature request                        |
| `GET`    | `/api/issues`     | Public                   | Retrieve all issues (Supports `sort`, `type`, `status` queries)   |
| `GET`    | `/api/issues/:id` | Public                   | Retrieve full details of a specific issue                         |
| `PATCH`  | `/api/issues/:id` | Maintainer/Contributor\* | Update issue field (\*Contributor can only edit own `open` issue) |
| `DELETE` | `/api/issues/:id` | Maintainer               | Permanently delete an issue                                       |

_(Requires `Authorization: <JWT_TOKEN>` header for protected routes)_

## 🚀 Setup Instructions

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/mdjasimuddin-dev/devpulse.git
cd DevPulse
```
