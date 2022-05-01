import express from "express";

const Router = express.Router();

import popularProducts from "./popular_products";
Router.get("/services/popular_products", popularProducts);

export default Router;
