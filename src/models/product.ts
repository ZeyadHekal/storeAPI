import client from "./../database";

export type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
};

export class ProductStore {
    async index(category?: string): Promise<Product[]> {
        try {
            const conn = await client.connect();
            let sql = "SELECT * FROM products";
            let params: string[] | undefined;
            if (category) {
                sql += " WHERE category=($1)";
                params = [category];
            }
            const results = await conn.query(sql, params);
            conn.release();
            return results.rows;
        } catch (error) {
            throw new Error(`Couldn't index procuts. Error: ${error}`);
        }
    }

    async show(id: number): Promise<Product | undefined> {
        try {
            const conn = await client.connect();
            const sql = "SELECT * FROM products WHERE id=($1)";
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at showing product ${id}. Error: ${error}`);
        }
    }

    async create(product: Omit<Product, "id">): Promise<Product> {
        try {
            const conn = await client.connect();
            const sql = "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *";
            const results = await conn.query(sql, [product.name, product.price, product.category]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at creating product ${product.name}. Error: ${error}`);
        }
    }

    async delete(id: number): Promise<Product | undefined> {
        try {
            const conn = await client.connect();
            const sql = "DELETE FROM products WHERE id=($1) RETURNING *";
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at deleting product ${id}. Error: ${error}`);
        }
    }

    async getByName(name: string): Promise<Product | undefined> {
        try {
            const conn = await client.connect();
            const sql = "SELECT * FROM products WHERE name=($1)";
            const results = await conn.query(sql, [name]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at getting product by name '${name}'. Error: ${error}`);
        }
    }
}
