import { AuthorizedUser, UserStore } from "./../user";

const users = new UserStore();

describe("Testing UserStore Model", () => {
    it("has all CRUD methods defined", () => {
        expect(users.index).toBeDefined();
        expect(users.create).toBeDefined();
        expect(users.show).toBeDefined();
        expect(users.delete).toBeDefined();
    });

    it("index method works", async () => {
        expect(typeof (await users.index())).toEqual("object");
    });

    let createdUserId: number;
    const username = "test_user";
    const password = "passWORD123";
    it("creates a new user", async () => {
        const user = await users.create({ username, firstName: "Zeyad", lastName: "Hekal", password });
        if (user) {
            createdUserId = user.id;
            expect(user.firstName).toBe("Zeyad");
            expect(user.lastName).toBe("Hekal");
        }
    });

    it("shows a user by id", async () => {
        const user = await users.show(createdUserId);
        if (user) {
            expect(user.firstName).toBe("Zeyad");
            expect(user.lastName).toBe("Hekal");
        }
    });

    it("shows a user by username", async () => {
        const user = await users.getByUsername("test_user");
        expect(user).toBeDefined;
        if (user) {
            expect(user.id).toBe(createdUserId);
            expect(user.firstName).toBe("Zeyad");
            expect(user.lastName).toBe("Hekal");
        }
    });

    it("authenticates a user", async () => {
        const jwt = ((await users.authenticate(createdUserId, password)) as AuthorizedUser).token;
        expect(typeof jwt).toBe("string");
    });

    it("deletes a user", async () => {
        const user = await users.delete(createdUserId);
        if (user) {
            expect(user.id).toBe(createdUserId);
            expect(user.firstName).toBe("Zeyad");
            expect(user.lastName).toBe("Hekal");
        }
    });
});
