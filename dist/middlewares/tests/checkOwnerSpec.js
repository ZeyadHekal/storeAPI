"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkOwner_1 = __importDefault(require("../checkOwner"));
const server_1 = __importDefault(require("../../server"));
const user_1 = require("../../models/user");
const supertest_1 = __importDefault(require("supertest"));
const username = "check_owner", password = "123";
const users = new user_1.UserStore();
const request = (0, supertest_1.default)(server_1.default);
server_1.default.post("/middleware/checkOwner/:id", checkOwner_1.default, (_req, res) => {
    res.status(200).json({ message: "success" });
});
describe("Tests checkOwner Middleware", () => {
    let myUser, myOtherUser;
    let jwt, otherJwt;
    beforeAll(async () => {
        myUser = await users.create({ username, firstName: "test", lastName: "suite", password });
        myOtherUser = await users.create({ username: username + "_other", firstName: "test", lastName: "suite", password });
        jwt = (await users.authenticate(myUser.id, password)).token;
        otherJwt = (await users.authenticate(myOtherUser.id, password)).token;
    });
    it("works when no token has been passed.", async () => {
        const res = await request.post("/middleware/checkOwner/" + myUser.id);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: "token needed" });
    });
    it("works when given another user.", async () => {
        const res = await request.post("/middleware/checkOwner/" + myUser.id).send({ token: otherJwt });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({ message: "access denied" });
    });
    it("works given a correct token for the owner.", async () => {
        const res = await request.post("/middleware/checkOwner/" + myUser.id).send({ token: jwt });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "success" });
    });
});
