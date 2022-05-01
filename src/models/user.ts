import client from "../database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export type User = {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    password_hash: string;
    isAdmin: boolean;
};

type UserCreation = {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    isAdmin?: boolean;
};

export type AuthorizedUser = {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    token: string;
    isAdmin: boolean;
};

export class UserStore {
    async index(): Promise<User[]> {
        try {
            const conn = await client.connect();
            const sql = 'SELECT id, username, "firstName", "lastName", "isAdmin" FROM users';
            const results = await conn.query(sql);
            conn.release();
            return results.rows;
        } catch (error) {
            throw new Error(`Error at indexing users. Error: ${error}`);
        }
    }

    async show(id: number): Promise<User | undefined> {
        try {
            const conn = await client.connect();
            const sql = 'SELECT id, username, "firstName", "lastName", "isAdmin" FROM users WHERE id=($1)';
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at showing user ${id}. Error: ${error}`);
        }
    }

    async create(user: UserCreation): Promise<AuthorizedUser> {
        try {
            if (user.isAdmin === undefined) {
                user.isAdmin = false;
            }
            const conn = await client.connect();
            const sql = 'INSERT INTO users (username, "firstName", "lastName", password_hash, "isAdmin") VALUES ($1, $2, $3, $4, $5) RETURNING *';
            const hash = await bcrypt.hash(user.password + process.env.PASSWORD_PEPPER, parseInt(process.env.SALT_ROUNDS as string));
            const results = await conn.query(sql, [user.username, user.firstName, user.lastName, hash, user.isAdmin]);
            const nonSensitiveUserData = {
                id: results.rows[0].id,
                username: results.rows[0].username,
                firstName: results.rows[0].firstName,
                lastName: results.rows[0].lastName,
                isAdmin: results.rows[0].isAdmin,
            };
            conn.release();
            const toReturn = { token: jwt.sign(nonSensitiveUserData, process.env.JWT_SECRET as jwt.Secret), ...nonSensitiveUserData };
            return toReturn;
        } catch (error) {
            throw new Error(`Error at creating user ${user.firstName}. Error: ${error}`);
        }
    }

    async delete(id: number): Promise<Omit<User, "password_hash"> | undefined> {
        try {
            const conn = await client.connect();
            const sql = "DELETE FROM users WHERE id=($1) RETURNING *";
            const results = await conn.query(sql, [id]);
            const nonSensitiveUserData = {
                id: results.rows[0].id,
                username: results.rows[0].username,
                firstName: results.rows[0].firstName,
                lastName: results.rows[0].lastName,
                isAdmin: results.rows[0].isAdmin,
            };
            conn.release();
            return nonSensitiveUserData;
        } catch (error) {
            throw new Error(`Error at deleting user ${id}. Error: ${error}`);
        }
    }

    async getByUsername(username: string): Promise<User | undefined> {
        try {
            const conn = await client.connect();
            const sql = "SELECT * FROM users WHERE username=($1)";
            const results = await conn.query(sql, [username]);
            conn.release();
            return results.rows[0];
        } catch (error) {
            throw new Error(`Error at showing user ${username}. Error: ${error}`);
        }
    }

    async authenticate(id: number, password: string): Promise<AuthorizedUser | boolean> {
        try {
            const conn = await client.connect();
            const sql = "SELECT * FROM users WHERE id=($1)";
            const results = await conn.query(sql, [id]);
            const user = results.rows[0] as User;
            conn.release();
            if (!bcrypt.compareSync(password + process.env.PASSWORD_PEPPER, user.password_hash)) {
                return false;
            }
            const nonSensitiveUserData = {
                id: results.rows[0].id,
                username: results.rows[0].username,
                firstName: results.rows[0].firstName,
                lastName: results.rows[0].lastName,
                isAdmin: results.rows[0].isAdmin,
            };
            return { token: jwt.sign(nonSensitiveUserData, process.env.JWT_SECRET as jwt.Secret), ...nonSensitiveUserData };
        } catch (error) {
            throw new Error(`Error at authenticating user ${id}. Error: ${error}`);
        }
    }
}
