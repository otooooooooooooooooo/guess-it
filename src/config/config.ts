require('dotenv').config();

export const config = {
  PORT: parseInt(process.env.PORT),
  CORS: Boolean(process.env.CORS),
};
