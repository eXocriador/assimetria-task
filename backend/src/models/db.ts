import { Pool, QueryResult, QueryResultRow } from 'pg';

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
] as const;

const loadConfig = (): DbConfig => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing database environment variables: ${missing.join(', ')}`
    );
  }

  const port = Number(process.env.DB_PORT);
  if (Number.isNaN(port)) {
    throw new Error('DB_PORT must be a valid number');
  }

  return {
    host: process.env.DB_HOST as string,
    port,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
  };
};

const pool = new Pool(loadConfig());

const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => pool.query<T>(text, params);

export { pool, query };
