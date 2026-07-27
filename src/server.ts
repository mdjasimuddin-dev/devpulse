import app from './app';
import config from './config/config.index';
import { connectDB } from './database/db.index';

const main = () => {
  connectDB();
  app.listen(config.server_port, () => {
    console.log(`Server Running Port is : ${config.server_port}`);
  });
};

main();
