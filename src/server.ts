import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: express.Application = express();
const address = `localhost:${process.env.SERVER_PORT}`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import cookieParser from "cookie-parser";
app.use(cookieParser());

import cors from "cors";
app.use(cors());

import Router from "./router";
app.use(Router);

app.get("/", function (req: Request, res: Response) {
    res.send("Welcome to Zeyad's first back-end online store!");
});

app.listen(process.env.SERVER_PORT, function () {
    console.log(`starting app on: ${address}`);
});

import handleAdminAccount from "./utilities/handleAdminAccount";
if (process.env.ENV != "test") handleAdminAccount();

export default app;
