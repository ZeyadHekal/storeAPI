"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProductsStore = void 0;
const database_1 = __importDefault(require("../database"));
class OrderProductsStore {
    async index(order_id) {
        try {
            const conn = await database_1.default.connect();
            const sql = "SELECT product_id AS id, quantity FROM orders_products WHERE order_id=($1)";
            const results = await conn.query(sql, [order_id]);
            conn.release();
            return results.rows;
        }
        catch (error) {
            throw new Error(`Error at indexing order_products for order ${order_id}. Error ${error}`);
        }
    }
    async show(order_id, product_id) {
        try {
            const conn = await database_1.default.connect();
            const sql = "SELECT product_id AS id, quantity FROM orders_products WHERE (order_id=($1) AND product_id=($2))";
            const results = await conn.query(sql, [order_id, product_id]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at showing product ${product_id} in order_products for order ${order_id}. Error: ${error}`);
        }
    }
    async create(order_id, product) {
        try {
            const conn = await database_1.default.connect();
            const sql = "INSERT INTO orders_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING product_id AS id, quantity";
            const results = await conn.query(sql, [order_id, product.id, product.quantity]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at create orders_products for order ${order_id} and product ${product.id}. Error: ${error}`);
        }
    }
    async delete(order_id, product_id) {
        try {
            const conn = await database_1.default.connect();
            const sql = "DELETE FROM orders_products WHERE (order_id=($1) AND product_id=($2)) RETURNING product_id AS id, quantity";
            const results = await conn.query(sql, [order_id, product_id]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at deleting from orders_products order ${order_id}, product ${product_id}`);
        }
    }
}
exports.OrderProductsStore = OrderProductsStore;
