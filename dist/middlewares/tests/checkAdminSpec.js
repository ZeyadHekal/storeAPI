"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkAdmin_1 = __importDefault(require("../checkAdmin"));
const server_1 = __importDefault(require("../../server"));
const user_1 = require("../../models/user");
const supertest_1 = __importDefault(require("supertest"));
const handleAdminAccount_1 = __importDefault(require("../../utilities/handleAdminAccount"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const username = process.env.DEFAULT_ADMIN_USER, password = process.env.DEFAULT_ADMIN_PASSWORD;
const users = new user_1.UserStore();
const request = (0, supertest_1.default)(server_1.default);
server_1.default.post("/middleware/checkAdmin", checkAdmin_1.default, (_req, res) => {
    res.status(200).json({ message: "success" });
});
describe("Tests checkAdmin Middleware", () => {
    let myUser;
    let jwt;
    beforeAll(async () => {
        await (0, handleAdminAccount_1.default)();
        myUser = (await users.getByUsername(username));
        jwt = (await users.authenticate(myUser.id, password)).token;
    });
    afterAll(async () => {
        await users.delete(myUser.id);
    });
    it("works when no token has been passed.", async () => {
        const res = await request.post("/middleware/checkAdmin");
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: "token needed" });
    });
    it("works when invalid token has been passed.", async () => {
        const res = await request.post("/middleware/checkAdmin").send({ token: "abcd" });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({ message: "access denied" });
    });
    it("works given a correct token.", async () => {
        const res = await request.post("/middleware/checkAdmin").send({ token: jwt });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "success" });
    });
});
