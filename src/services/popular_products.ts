import { Request, Response } from "express";
import client from "../database";

const popularProducts = async (req: Request, res: Response) => {
    try {
        const conn = await client.connect();
        // Firstly let's get orders_products rows that correspond to completed orders
        const sql = "SELECT orders_products.* FROM orders_products INNER JOIN orders ON orders.id=orders_products.order_id WHERE orders.status='completed'";
        // Use the rows joined with the products to get the 5 most popular products
        const sql2 = `SELECT prod.product_id AS id, prod.name, prod.price, prod.category, CAST(SUM(ord_prod.quantity) AS INTEGER) AS quantity \
        FROM (SELECT id AS product_id, name, price, category FROM products) AS prod \
        INNER JOIN (${sql}) AS ord_prod ON prod.product_id=ord_prod.product_id \
        GROUP BY prod.product_id, prod.name, prod.price, prod.category ORDER BY SUM(ord_prod.quantity) DESC LIMIT 5`;
        const results = await conn.query(sql2);
        conn.release();
        res.status(200).json(results.rows);
    } catch (error) {
        res.status(500).json({ message: "error", error });
    }
};

export default popularProducts;
