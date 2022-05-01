import checkLogged from "../checkLogged";
import { Request, Response } from "express";
import app from "../../server";
import { AuthorizedUser, UserStore } from "../../models/user";
import supertest from "supertest";

const username = "check_logged",
    password = "123";

const users = new UserStore();
const request = supertest(app);

app.post("/middleware/checkLogged", checkLogged, (_req: Request, res: Response) => {
    res.status(200).json({ message: "success" });
});

describe("Tests checkLogged Middleware", () => {
    let myUser: AuthorizedUser;
    let jwt: string;
    beforeAll(async () => {
        myUser = await users.create({ username, firstName: "test", lastName: "suite", password });
        jwt = ((await users.authenticate(myUser.id, password)) as AuthorizedUser).token;
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
