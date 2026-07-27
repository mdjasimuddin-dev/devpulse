import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  server_port: process.env.SERVER_PORT,
  connection_string: process.env.DB_CONNECTION_STRING,
  token_secret: process.env.TOKEN_SECRET_KEY,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET_KEY,
};

export default config;
