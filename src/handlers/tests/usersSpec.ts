import supertest from "supertest";
import app from "../../server";
import dotenv from "dotenv";
import { UserStore, User, AuthorizedUser } from "../../models/user";
import handleAdminAccount from "../../utilities/handleAdminAccount";

dotenv.config();

const request = supertest(app);
const users = new UserStore();

const admin_username = process.env.DEFAULT_ADMIN_USER as string,
    admin_password = process.env.DEFAULT_ADMIN_PASSWORD as string;
const test_username = "my-non-existing-user",
    test_password = "my-very-secure-password";
let adminJwt: string, adminId: number, testId: number, testJwt: string;
let usersOnStart: User[];

describe("Test suite for users route", () => {
    /*
        Test suites here are dependent on each other.
        Meaning you can't focus on a describe function,
        because they use the user created in the CREATE endpoint test.
    */

    beforeAll(async () => {
        await handleAdminAccount();
        const adminUser = (await users.getByUsername(admin_username)) as User;
        adminId = adminUser.id;
        adminJwt = ((await users.authenticate(adminId, admin_password)) as AuthorizedUser).token;
        usersOnStart = await users.index();
    });

    describe("Test suite for GET index endpoint", () => {
        it("Responds with 401 to request without token", async () => {
            const res = await request.get("/users");
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual({ message: "token needed" });
        });

        it("Responds with 403 to unauthorized access", async () => {
            const res = await request.get("/users").set("Authorization", "Bearer 123");
            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual({ message: "access denied" });
        });

        it("Shows users for authorized admins", async () => {
            const res = await request.get("/users").set("Authorization", "Bearer " + adminJwt);
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
            testId = res.body.data.id;
            testJwt = res.body.access_token;
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.username).toBe(test_username);
            expect(res.body.data.firstName).toBe("Zeyad");
            expect(res.body.data.lastName).toBe("Hekal");
        });
    });

    describe("Test suite for GET show endpoint", () => {
        it("Responds correctly to a request without token", async () => {
            const res = await request.get("/users/" + testId);
            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual({ message: "token needed" });
        });

        it("Responds correctly to a not authorized request", async () => {
            const res = await request.get("/users/" + testId).set("Authorization", "Bearer 123");
            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual({ message: "access denied" });
        });

        it("Responds correctly to an authorized request (owner)", async () => {
            const res = await request.get("/users/" + testId).set("Authorization", "Bearer " + testJwt);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.user).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
        });

        it("Responds correctly to an authorized request (admin)", async () => {
            const res = await request.get("/users/" + testId).set("Authorization", "Bearer " + adminJwt);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.user).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
        });

        // Only for admins as normal users can only show their data
        it("Responds correctly to a wrong user id", async () => {
            const res = await request.get("/users/123123123").set("Authorization", "Bearer " + adminJwt);
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
            const res = await request.delete("/users/" + testId).set("Authorization", "Bearer 123");
            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual({ message: "access denied" });
        });

        it("Responds correctly to an authorized request (owner)", async () => {
            const res = await request.delete("/users/" + testId).set("Authorization", "Bearer " + testJwt);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedUser).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
            const newTestUser = await users.create({ username: test_username, password: test_password, firstName: "Zeyad", lastName: "Hekal" });
            testId = newTestUser.id;
            testJwt = newTestUser.token;
        });

        it("Responds correctly to an authorized request (admin)", async () => {
            const res = await request.delete("/users/" + testId).set("Authorization", "Bearer " + adminJwt);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedUser).toEqual({ id: testId, username: test_username, firstName: "Zeyad", lastName: "Hekal", isAdmin: false });
            const newTestUser = await users.create({ username: test_username, password: test_password, firstName: "Zeyad", lastName: "Hekal" });
            testId = newTestUser.id;
            testJwt = newTestUser.token;
        });

        // Only for admins as normal users can only delete their data
        it("Responds correctly to a wrong user id", async () => {
            const res = await request.delete("/users/123123123").set("Authorization", "Bearer " + adminJwt);
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
