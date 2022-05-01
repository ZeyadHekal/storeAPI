import { ProductStore } from "../models/product";
import { Response, Request } from "express";

const products = new ProductStore();

const create = async (req: Request, res: Response) => {
    try {
        if ((req.body.name, req.body.price, req.body.category)) {
            const product = await products.getByName(req.body.name);
            if (product === undefined) {
                const newProduct = await products.create({ ...req.body });
                res.status(200).json({ message: "success", product: newProduct });
            } else {
                res.status(400).json({ message: "A product with the same name already exists" });
            }
        } else {
            res.status(400).json({ message: "missing parameters", parameters: ["name", "price", "category"] });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const index = async (req: Request, res: Response) => {
    try {
        const allProducts = await products.index(req.body.category);
        res.status(200).json(allProducts);
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const show = async (req: Request, res: Response) => {
    try {
        const product = await products.show(parseInt(req.params.id));
        if (product) {
            res.status(200).json({ message: "success", product });
        } else {
            res.status(400).json({ message: "product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const _delete = async (req: Request, res: Response) => {
    try {
        const product = await products.show(parseInt(req.params.id));
        if (product) {
            await products.delete(product.id);
            res.status(200).json({ message: "success", deletedProduct: product });
        } else {
            res.status(400).json({ message: "product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

const productsRouter = { create, index, show, _delete };
export default productsRouter;
