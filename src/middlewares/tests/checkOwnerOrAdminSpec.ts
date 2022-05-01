import checkOwnerOrAdmin from "../checkOwnerOrAdmin";
import { Request, Response } from "express";
import app from "../../server";
import { AuthorizedUser, User, UserStore } from "../../models/user";
import supertest from "supertest";
import handleAdminAccount from "../../utilities/handleAdminAccount";

const username = "check_owner",
    password = "123";
const username_admin = process.env.DEFAULT_ADMIN_USER as string,
    password_admin = process.env.DEFAULT_ADMIN_PASSWORD as string;

const users = new UserStore();
const request = supertest(app);

app.get("/middleware/checkOwnerOrAdmin/:id", checkOwnerOrAdmin, (_req: Request, res: Response) => {
    res.status(200).json({ message: "success" });
});

describe("Tests checkOwnerOrAdmin Middleware", () => {
    let myUser: AuthorizedUser, myOtherUser: AuthorizedUser, myAdminUser: User;
    let jwt: string, otherJwt: string, adminJwt: string;
    beforeAll(async () => {
        await handleAdminAccount();
        myUser = await users.create({ username, firstName: "test", lastName: "suite", password });
        myOtherUser = await users.create({ username: username + "_other", firstName: "test", lastName: "suite", password });
        myAdminUser = (await users.getByUsername(username_admin)) as User;
        jwt = ((await users.authenticate(myUser.id, password)) as AuthorizedUser).token;
        otherJwt = ((await users.authenticate(myOtherUser.id, password)) as AuthorizedUser).token;
        adminJwt = ((await users.authenticate(myAdminUser.id, password_admin)) as AuthorizedUser).token;
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
