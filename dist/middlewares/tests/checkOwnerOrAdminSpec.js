"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkOwnerOrAdmin_1 = __importDefault(require("../checkOwnerOrAdmin"));
const server_1 = __importDefault(require("../../server"));
const user_1 = require("../../models/user");
const supertest_1 = __importDefault(require("supertest"));
const handleAdminAccount_1 = __importDefault(require("../../utilities/handleAdminAccount"));
const username = "check_owner", password = "123";
const username_admin = process.env.DEFAULT_ADMIN_USER, password_admin = process.env.DEFAULT_ADMIN_PASSWORD;
const users = new user_1.UserStore();
const request = (0, supertest_1.default)(server_1.default);
server_1.default.get("/middleware/checkOwnerOrAdmin/:id", checkOwnerOrAdmin_1.default, (_req, res) => {
    res.status(200).json({ message: "success" });
});
describe("Tests checkOwnerOrAdmin Middleware", () => {
    let myUser, myOtherUser, myAdminUser;
    let jwt, otherJwt, adminJwt;
    beforeAll(async () => {
        await (0, handleAdminAccount_1.default)();
        myUser = await users.create({ username, firstName: "test", lastName: "suite", password });
        myOtherUser = await users.create({ username: username + "_other", firstName: "test", lastName: "suite", password });
        myAdminUser = (await users.getByUsername(username_admin));
        jwt = (await users.authenticate(myUser.id, password)).token;
        otherJwt = (await users.authenticate(myOtherUser.id, password)).token;
        adminJwt = (await users.authenticate(myAdminUser.id, password_admin)).token;
    });
    afterAll(async () => {
        await users.delete(myAdminUser.id);
    });
    it("works when no token has been passed.", async () => {
        const res = await request.get("/middleware/checkOwnerOrAdmin/" + myUser.id);
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ message: "token needed" });
    });
    it("works when given another user.", async () => {
        const res = await request.get("/middleware/checkOwnerOrAdmin/" + myUser.id).send({ token: otherJwt });
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({ message: "access denied" });
    });
    it("works given a correct token for the owner user.", async () => {
        const res = await request.get("/middleware/checkOwnerOrAdmin/" + myUser.id).send({ token: jwt, id: myUser.id });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "success" });
    });
    it("works given a correct token for admin user.", async () => {
        const res = await request.get("/middleware/checkOwnerOrAdmin/" + myUser.id).send({ token: adminJwt, id: myUser.id });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "success" });
    });
});
