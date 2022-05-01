"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductStore = void 0;
const database_1 = __importDefault(require("./../database"));
class ProductStore {
    async index(category) {
        try {
            const conn = await database_1.default.connect();
            let sql = "SELECT * FROM products";
            let params;
            if (category) {
                sql += " WHERE category=($1)";
                params = [category];
            }
            const results = await conn.query(sql, params);
            conn.release();
            return results.rows;
        }
        catch (error) {
            throw new Error(`Couldn't index procuts. Error: ${error}`);
        }
    }
    async show(id) {
        try {
            const conn = await database_1.default.connect();
            const sql = "SELECT * FROM products WHERE id=($1)";
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at showing product ${id}. Error: ${error}`);
        }
    }
    async create(product) {
        try {
            const conn = await database_1.default.connect();
            const sql = "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *";
            const results = await conn.query(sql, [product.name, product.price, product.category]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at creating product ${product.name}. Error: ${error}`);
        }
    }
    async delete(id) {
        try {
            const conn = await database_1.default.connect();
            const sql = "DELETE FROM products WHERE id=($1) RETURNING *";
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at deleting product ${id}. Error: ${error}`);
        }
    }
    async getByName(name) {
        try {
            const conn = await database_1.default.connect();
            const sql = "SELECT * FROM products WHERE name=($1)";
            const results = await conn.query(sql, [name]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at getting product by name '${name}'. Error: ${error}`);
        }
    }
}
exports.ProductStore = ProductStore;
