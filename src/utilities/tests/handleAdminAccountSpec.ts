import handleAdminAccount from "../handleAdminAccount";
import { UserStore } from "./../../models/user";
import dotenv from "dotenv";

dotenv.config();

const users = new UserStore();

describe("Testing handleAdminAccount utility", () => {
    let totalAccounts: number;
    beforeAll(async () => {
        totalAccounts = (await users.index()).length;
    });

    it("adds when default admin doesn't exist", async () => {
        await handleAdminAccount();
        expect((await users.index()).length).toBe(totalAccounts + 1);
        const default_username = process.env.DEFAULT_ADMIN_USER;
        if (default_username) expect((await users.getByUsername(default_username))?.username).toEqual(default_username);
    });

    it("doesn't add when default admin exist", async () => {
        await handleAdminAccount();
        expect((await users.index()).length).toBe(totalAccounts + 1);
    });
});
