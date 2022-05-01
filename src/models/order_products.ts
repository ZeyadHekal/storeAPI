import client from "../database";

export type ProductInOrder = {
    id: number;
    quantity: number;
};

export class OrderProductsStore {
    async index(order_id: number): Promise<ProductInOrder[]> {
        try {
            const conn = await client.connect();
            const sql = "SELECT product_id AS id, quantity FROM orders_products WHERE order_id=($1)";
            const results = await conn.query(sql, [order_id]);
            conn.release();
            return results.rows;
        } catch (error) {
            throw new Error(`Error at indexing order_products for order ${order_id}. Error ${error}`);
        }
    }

    async show(order_id: number, product_id: number): Promise<ProductInOrder | undefined> {
        try {
            const conn = await client.connect();
            const sql = "SELECT product_id AS id, quantity FROM orders_products WHERE (order_id=($1) AND product_id=($2))";
            const results = await conn.query(sql, [order_id, product_id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at showing product ${product_id} in order_products for order ${order_id}. Error: ${error}`);
        }
    }

    async create(order_id: number, product: ProductInOrder): Promise<ProductInOrder> {
        try {
            const conn = await client.connect();
            const sql = "INSERT INTO orders_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING product_id AS id, quantity";
            const results = await conn.query(sql, [order_id, product.id, product.quantity]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at create orders_products for order ${order_id} and product ${product.id}. Error: ${error}`);
        }
    }

    async delete(order_id: number, product_id: number): Promise<ProductInOrder | undefined> {
        try {
            const conn = await client.connect();
            const sql = "DELETE FROM orders_products WHERE (order_id=($1) AND product_id=($2)) RETURNING product_id AS id, quantity";
            const results = await conn.query(sql, [order_id, product_id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at deleting from orders_products order ${order_id}, product ${product_id}`);
        }
    }
}
