"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../../server"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("../../models/user");
const handleAdminAccount_1 = __importDefault(require("../../utilities/handleAdminAccount"));
dotenv_1.default.config();
const request = (0, supertest_1.default)(server_1.default);
const users = new user_1.UserStore();
const admin_username = process.env.DEFAULT_ADMIN_USER, admin_password = process.env.DEFAULT_ADMIN_PASSWORD;
const test_username = "my-non-existing-user", test_password = "my-very-secure-password";
let adminJwt, adminId, testId, testJwt;
let usersOnStart;
describe("Test suite for users route", () => {
    /*
        Test suites here are dependent on each other.
        Meaning you can't focus on a describe function,
        because they use the user created in the CREATE endpoint test.
    */
    beforeAll(async () => {
        await (0, handleAdminAccount_1.default)();
        const adminUser = (await users.getByUsername(admin_username));
        adminId = adminUser.id;
        adminJwt = (await users.authenticate(adminId, admin_password)).token;
        usersOnStart = await users.index();
    });
    describe("Test suite for GET index endpoint", () => {
        it("Responds with 401 to request without token", async () => {
            const res = await request.get("/users");
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("Responds with 403 to unauthorized access", async () => {
            const res = await request.get("/users").send({ token: "123" });
            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("Shows users for authorized admins", async () => {
            const res = await request.get("/users").send({ token: adminJwt });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(usersOnStart);
        });
    });
    describe("Test suite for POST create endpoint", () => {
        it("Responds correctly to missing parameters", async () => {
            const res = await request.post("/users").send({ username: admin_username });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: "missing parameters", parameters: ["username", "password", "firstName", "lastName"] });
        });
        it("Fails to create a user with an existing username", async () => {
            const res = await request.post("/users").send({ username: admin_username, password: admin_password, firstName: "Default", lastName: "Admin" });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: "There is already a user with this username!" });
        });
        it("creates a user if username is not used", async () => {
            const res = await request.post("/users").send({ username: test_username, password: test_password, firstName: "Zeyad", lastName: "Hekal" });
            testId = res.body.id;
            testJwt = res.body.token;
            expect(res.statusCode).toEqual(200);
            expect(res.body.username).toBe(test_username);
            expect(res.body.firstName).toBe("Zeyad");
            expect(res.body.lastName).toBe("Hekal");
        });
    });
    describe("Test suite for GET show endpoint", () => {
        it("Responds correctly to a request without token", async () => {
            const res = await request.get("/users/" + testId);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("Responds correctly to a not authorized request", async () => {
            const res = await request.get("/users/" + testId).send({ token: "123" });
            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("Responds correctly to an authorized request (owner)", async () => {
            const res = await request.get("/users/" + testId).send({ token: testJwt });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.user).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
        });
        it("Responds correctly to an authorized request (admin)", async () => {
            const res = await request.get("/users/" + testId).send({ token: adminJwt });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.user).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
        });
        // Only for admins as normal users can only show their data
        it("Responds correctly to a wrong user id", async () => {
            const res = await request.get("/users/123123123").send({ token: adminJwt });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: "user doesn't exist" });
        });
    });
    describe("Test suite for POST DELETE endpoint", () => {
        it("Responds correctly to a request without token", async () => {
            const res = await request.delete("/users/" + testId);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("Responds correctly to a not authorized request", async () => {
            const res = await request.delete("/users/" + testId).send({ token: "123" });
            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("Responds correctly to an authorized request (owner)", async () => {
            const res = await request.delete("/users/" + testId).send({ token: testJwt });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedUser).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
            const newTestUser = await users.create({ username: test_username, password: test_password, firstName: "Zeyad", lastName: "Hekal" });
            testId = newTestUser.id;
            testJwt = newTestUser.token;
        });
        it("Responds correctly to an authorized request (admin)", async () => {
            const res = await request.delete("/users/" + testId).send({ token: adminJwt });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedUser).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
            const newTestUser = await users.create({ username: test_username, password: test_password, firstName: "Zeyad", lastName: "Hekal" });
            testId = newTestUser.id;
            testJwt = newTestUser.token;
        });
        // Only for admins as normal users can only delete their data
        it("Responds correctly to a wrong user id", async () => {
            const res = await request.delete("/users/123123123").send({ token: adminJwt });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: "user doesn't exist" });
        });
    });
    describe("Test suite for POST authenticate endpoint", () => {
        it("Responds correctly to missing parameters", async () => {
            const res = await request.post("/users/" + testId + "/authenticate");
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: "missing parameters", parameters: ["password"] });
        });
        it("Fails to authenticate wrong id", async () => {
            const res = await request.post("/users/123123123/authenticate").send({ password: test_password });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: "user doesn't exist" });
        });
        it("works when username and password are correct", async () => {
            const res = await request.post("/users/" + testId + "/authenticate").send({ password: test_password });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.data).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
        });
    });
});
