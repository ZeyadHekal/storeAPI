"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const host = process.env.DB_HOST;
const port = parseInt(process.env.DB_PORT);
const database = process.env.ENV == "dev" ? process.env.DB_NAME : process.env.DB_NAME_TEST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const client = new pg_1.Pool({ host, port, database, user, password });
exports.default = client;
