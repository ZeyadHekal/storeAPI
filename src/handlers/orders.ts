import { Response, Request } from "express";
import { OrderStore } from "../models/order";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ProductStore } from "../models/product";
import { OrderProductsStore } from "../models/order_products";

dotenv.config();

const orders = new OrderStore();
const products = new ProductStore();
const order_products = new OrderProductsStore();

const create = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.create(parseInt(myJwt.id));
        res.status(200).json({ message: "success", order: myOrder });
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const index = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrders = await orders.index(myJwt.isAdmin ? undefined : myJwt.id);
        res.status(200).json(myOrders);
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const show = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.show(parseInt(req.params.id));
        if (myOrder) {
            if (myJwt.isAdmin || myOrder.user_id == myJwt.id) {
                res.status(200).json({ message: "success", order: myOrder });
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } else {
            res.status(400).json({ message: "order doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const _delete = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.show(parseInt(req.params.id));
        if (myOrder) {
            if (myJwt.isAdmin || myOrder.user_id == myJwt.id) {
                await orders.delete(myOrder.id);
                res.status(200).json({ message: "success", deletedOrder: myOrder });
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } else {
            res.status(400).json({ message: "order doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const complete = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.show(parseInt(req.params.id));
        if (myOrder) {
            if (myJwt.isAdmin || myOrder.user_id == myJwt.id) {
                const order = await orders.complete(myOrder.id);
                res.status(200).json({ message: "success", order });
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } else {
            res.status(400).json({ message: "order doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const indexProducts = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.show(parseInt(req.params.id));
        if (myOrder) {
            if (myJwt.isAdmin || myOrder.user_id == myJwt.id) {
                const myProducts = await order_products.index(myOrder.id);
                res.status(200).json(myProducts);
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } else {
            res.status(400).json({ message: "order doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const showProduct = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.show(parseInt(req.params.id));
        if (myOrder) {
            if (myJwt.isAdmin || myOrder.user_id == myJwt.id) {
                const myProduct = await products.show(parseInt(req.params.product_id));
                if (myProduct) {
                    const orderProduct = await order_products.show(myOrder.id, parseInt(req.params.product_id));
                    if (orderProduct) {
                        res.status(200).json({ message: "success", product: orderProduct });
                    } else {
                        res.status(400).json({ message: "product isn't added to this order" });
                    }
                } else {
                    res.status(400).json({ message: "product doesn't exist" });
                }
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } else {
            res.status(400).json({ message: "order doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const addProduct = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.show(parseInt(req.params.id));
        if (myOrder) {
            if (myJwt.isAdmin || myOrder.user_id == myJwt.id) {
                if (myOrder.status == "active") {
                    if (req.body.quantity && req.body.product_id) {
                        const myProduct = await products.show(parseInt(req.body.product_id));
                        if (myProduct) {
                            const orderProduct = await order_products.show(myOrder.id, parseInt(req.body.product_id));
                            if (!orderProduct) {
                                const addedOrderProduct = await order_products.create(myOrder.id, { id: myProduct.id, quantity: parseInt(req.body.quantity) });
                                res.status(200).json({ message: "success", product: addedOrderProduct });
                            } else {
                                res.status(400).json({ message: "product is already added to this order" });
                            }
                        } else {
                            res.status(400).json({ message: "product doesn't exist" });
                        }
                    } else {
                        res.status(400).json({ message: "missing parameters", parameters: ["quantity"] });
                    }
                } else {
                    res.status(400).json({ message: "cannot modify a completed order" });
                }
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } else {
            res.status(400).json({ message: "order doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const deleteProduct = async (req: Request, res: Response) => {
    try {
        // JWT is guranteed to exist and be verified as it was processed by a middleware
        const auth = req.headers.authorization as string;
        const myJwt = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
        const myOrder = await orders.show(parseInt(req.params.id));
        if (myOrder) {
            if (myJwt.isAdmin || myOrder.user_id == myJwt.id) {
                if (myOrder.status == "active") {
                    const myProduct = await products.show(parseInt(req.params.product_id));
                    if (myProduct) {
                        const orderProduct = await order_products.show(myOrder.id, parseInt(req.params.product_id));
                        if (orderProduct) {
                            const deletedProduct = await order_products.delete(myOrder.id, parseInt(req.params.product_id));
                            res.status(200).json({ message: "success", deletedProduct });
                        } else {
                            res.status(400).json({ message: "product isn't added to this order" });
                        }
                    } else {
                        res.status(400).json({ message: "product doesn't exist" });
                    }
                } else {
                    res.status(400).json({ message: "cannot modify a completed order" });
                }
            } else {
                res.status(403).json({ message: "access denied" });
            }
        } else {
            res.status(400).json({ message: "order doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const ordersRouter = { create, index, show, _delete, complete, indexProducts, showProduct, addProduct, deleteProduct };
export default ordersRouter;
