import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.DB_HOST;
const port = parseInt(process.env.DB_PORT as string);
const database = process.env.ENV == "dev" ? process.env.DB_NAME : process.env.DB_NAME_TEST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const client = new Pool({ host, port, database, user, password });

export default client;
