import client from "../database";

export type Order = {
    id: number;
    status: string;
    user_id: number;
};

export class OrderStore {
    async index(user_id?: number): Promise<Order[]> {
        try {
            const conn = await client.connect();
            let sql = "SELECT * FROM orders";
            let params: number[] | undefined;
            if (user_id) {
                sql += " WHERE user_id=($1)";
                params = [user_id];
            }
            const results = await conn.query(sql, params);
            conn.release();
            return results.rows;
        } catch (error) {
            throw new Error(`There was an error at indexing orders. Error ${error}`);
        }
    }

    async show(id: number): Promise<Order | undefined> {
        try {
            const conn = await client.connect();
            const sql = "SELECT * FROM orders WHERE id=($1)";
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at showing order ${id}. Error ${error}`);
        }
    }

    async create(user_id: number): Promise<Order> {
        try {
            const conn = await client.connect();
            const sql = "INSERT INTO orders (user_id) VALUES ($1) RETURNING *";
            const results = await conn.query(sql, [user_id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at creating order for user ${user_id}. Error ${error}`);
        }
    }

    async delete(id: number): Promise<Order | undefined> {
        try {
            const conn = await client.connect();
            const sql = "DELETE FROM orders WHERE id=($1) RETURNING *";
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at deleting order ${id}. Error ${error}`);
        }
    }

    async complete(id: number): Promise<Order | undefined> {
        try {
            const conn = await client.connect();
            const sql = "UPDATE orders SET status='completed' WHERE id=($1) RETURNING *";
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at completing order ${id}. Error ${error}`);
        }
    }
}
