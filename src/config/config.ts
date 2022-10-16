require('dotenv').config();
/**
 * Config object which contains all app configs
 */
export const config = {
  PORT: parseInt(process.env.PORT),
  CORS: Boolean(process.env.CORS),
  API_KEY: process.env.API_KEY,
};

if (!config.API_KEY)
  throw new Error('API KEY not provided. See documentation.');
