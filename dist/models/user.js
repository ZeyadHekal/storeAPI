"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStore = void 0;
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
class UserStore {
    async index() {
        try {
            const conn = await database_1.default.connect();
            const sql = 'SELECT id, username, "firstName", "lastName", "isAdmin" FROM users';
            const results = await conn.query(sql);
            conn.release();
            return results.rows;
        }
        catch (error) {
            throw new Error(`Error at indexing users. Error: ${error}`);
        }
    }
    async show(id) {
        try {
            const conn = await database_1.default.connect();
            const sql = 'SELECT id, username, "firstName", "lastName", "isAdmin" FROM users WHERE id=($1)';
            const results = await conn.query(sql, [id]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at showing user ${id}. Error: ${error}`);
        }
    }
    async create(user) {
        try {
            if (user.isAdmin === undefined) {
                user.isAdmin = false;
            }
            const conn = await database_1.default.connect();
            const sql = 'INSERT INTO users (username, "firstName", "lastName", password_hash, "isAdmin") VALUES ($1, $2, $3, $4, $5) RETURNING *';
            const hash = await bcrypt_1.default.hash(user.password + process.env.PASSWORD_PEPPER, parseInt(process.env.SALT_ROUNDS));
            const results = await conn.query(sql, [user.username, user.firstName, user.lastName, hash, user.isAdmin]);
            const nonSensitiveUserData = {
                id: results.rows[0].id,
                username: results.rows[0].username,
                firstName: results.rows[0].firstName,
                lastName: results.rows[0].lastName,
                isAdmin: results.rows[0].isAdmin,
            };
            conn.release();
            const toReturn = { token: jsonwebtoken_1.default.sign(nonSensitiveUserData, process.env.JWT_SECRET), ...nonSensitiveUserData };
            return toReturn;
        }
        catch (error) {
            throw new Error(`Error at creating user ${user.firstName}. Error: ${error}`);
        }
    }
    async delete(id) {
        try {
            const conn = await database_1.default.connect();
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
        }
        catch (error) {
            throw new Error(`Error at deleting user ${id}. Error: ${error}`);
        }
    }
    async getByUsername(username) {
        try {
            const conn = await database_1.default.connect();
            const sql = "SELECT * FROM users WHERE username=($1)";
            const results = await conn.query(sql, [username]);
            conn.release();
            return results.rows[0];
        }
        catch (error) {
            throw new Error(`Error at showing user ${username}. Error: ${error}`);
        }
    }
    async authenticate(id, password) {
        try {
            const conn = await database_1.default.connect();
            const sql = "SELECT * FROM users WHERE id=($1)";
            const results = await conn.query(sql, [id]);
            const user = results.rows[0];
            conn.release();
            if (!bcrypt_1.default.compareSync(password + process.env.PASSWORD_PEPPER, user.password_hash)) {
                return false;
            }
            const nonSensitiveUserData = {
                id: results.rows[0].id,
                username: results.rows[0].username,
                firstName: results.rows[0].firstName,
                lastName: results.rows[0].lastName,
                isAdmin: results.rows[0].isAdmin,
            };
            return { token: jsonwebtoken_1.default.sign(nonSensitiveUserData, process.env.JWT_SECRET), ...nonSensitiveUserData };
        }
        catch (error) {
            throw new Error(`Error at authenticating user ${id}. Error: ${error}`);
        }
    }
}
exports.UserStore = UserStore;
