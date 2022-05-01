import checkOwner from "../checkOwner";
import { Request, Response } from "express";
import app from "../../server";
import { AuthorizedUser, UserStore } from "../../models/user";
import supertest from "supertest";

const username = "check_owner",
    password = "123";

const users = new UserStore();
const request = supertest(app);

app.post("/middleware/checkOwner/:id", checkOwner, (_req: Request, res: Response) => {
    res.status(200).json({ message: "success" });
});

describe("Tests checkOwner Middleware", () => {
    let myUser: AuthorizedUser, myOtherUser: AuthorizedUser;
    let jwt: string, otherJwt: string;
    beforeAll(async () => {
        myUser = await users.create({ username, firstName: "test", lastName: "suite", password });
        myOtherUser = await users.create({ username: username + "_other", firstName: "test", lastName: "suite", password });
        jwt = ((await users.authenticate(myUser.id, password)) as AuthorizedUser).token;
        otherJwt = ((await users.authenticate(myOtherUser.id, password)) as AuthorizedUser).token;
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
