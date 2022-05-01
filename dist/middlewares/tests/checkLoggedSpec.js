"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkLogged_1 = __importDefault(require("../checkLogged"));
const server_1 = __importDefault(require("../../server"));
const user_1 = require("../../models/user");
const supertest_1 = __importDefault(require("supertest"));
const username = "check_logged", password = "123";
const users = new user_1.UserStore();
const request = (0, supertest_1.default)(server_1.default);
server_1.default.post("/middleware/checkLogged", checkLogged_1.default, (_req, res) => {
    res.status(200).json({ message: "success" });
});
describe("Tests checkLogged Middleware", () => {
    let myUser;
    let jwt;
    beforeAll(async () => {
        myUser = await users.create({ username, firstName: "test", lastName: "suite", password });
        jwt = (await users.authenticate(myUser.id, password)).token;
    });
    it("works when no token has been passed.", async () => {
        const res = await request.post("/middleware/checkLogged");
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: "token needed" });
    });
    it("works given a correct token.", async () => {
        const res = await request.post("/middleware/checkLogged").send({ token: jwt });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "success" });
    });
});
