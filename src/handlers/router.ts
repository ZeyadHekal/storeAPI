import express from "express";
import checkAdmin from "../middlewares/checkAdmin";
import checkOwnerOrAdmin from "../middlewares/checkOwnerOrAdmin";

const Router = express.Router();

import usersRoute from "./users";
Router.get("/users", checkAdmin, usersRoute.index);
Router.get("/users/:id", checkOwnerOrAdmin, usersRoute.show);
Router.post("/users", usersRoute.create);
Router.delete("/users/:id", checkOwnerOrAdmin, usersRoute._delete);
Router.post("/users/:id/authenticate", usersRoute.authenticate);

import productsRouter from "./products";
Router.get("/products", productsRouter.index);
Router.get("/products/:id", productsRouter.show);
Router.post("/products", checkAdmin, productsRouter.create);
Router.delete("/products/:id", checkAdmin, productsRouter._delete);

import ordersRouter from "./orders";
import checkLogged from "../middlewares/checkLogged";
Router.get("/orders", checkLogged, ordersRouter.index);
Router.get("/orders/:id", checkLogged, ordersRouter.show);
Router.post("/orders", checkLogged, ordersRouter.create);
Router.delete("/orders/:id", checkLogged, ordersRouter._delete);
Router.get("/orders/:id/products", checkLogged, ordersRouter.indexProducts);
Router.get("/orders/:id/products/:product_id", checkLogged, ordersRouter.showProduct);
Router.post("/orders/:id/products", checkLogged, ordersRouter.addProduct);
Router.delete("/orders/:id/products/:product_id", checkLogged, ordersRouter.deleteProduct);
Router.post("/orders/:id/complete", checkLogged, ordersRouter.complete);

export default Router;
