import checkAdmin from "../checkAdmin";
import { Request, Response } from "express";
import app from "../../server";
import { AuthorizedUser, User, UserStore } from "../../models/user";
import supertest from "supertest";
import handleAdminAccount from "../../utilities/handleAdminAccount";
import dotenv from "dotenv";

dotenv.config();

const username = process.env.DEFAULT_ADMIN_USER as string,
    password = process.env.DEFAULT_ADMIN_PASSWORD as string;

const users = new UserStore();
const request = supertest(app);

app.post("/middleware/checkAdmin", checkAdmin, (_req: Request, res: Response) => {
    res.status(200).json({ message: "success" });
});

describe("Tests checkAdmin Middleware", () => {
    let myUser: User;
    let jwt: string;
    beforeAll(async () => {
        await handleAdminAccount();
        myUser = (await users.getByUsername(username)) as User;
        jwt = ((await users.authenticate(myUser.id, password)) as AuthorizedUser).token;
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
