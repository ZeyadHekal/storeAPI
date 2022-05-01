import express from "express";

const Router = express.Router();

import handlersRouter from "./handlers/router";
Router.use(handlersRouter);

import servicesRouter from "./services/router";
Router.use(servicesRouter);

export default Router;
