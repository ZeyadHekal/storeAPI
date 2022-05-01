"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleAdminAccount_1 = __importDefault(require("../handleAdminAccount"));
const user_1 = require("./../../models/user");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const users = new user_1.UserStore();
describe("Testing handleAdminAccount utility", () => {
    let totalAccounts;
    beforeAll(async () => {
        totalAccounts = (await users.index()).length;
    });
    it("adds when default admin doesn't exist", async () => {
        await (0, handleAdminAccount_1.default)();
        expect((await users.index()).length).toBe(totalAccounts + 1);
        const default_username = process.env.DEFAULT_ADMIN_USER;
        if (default_username)
            expect((await users.getByUsername(default_username))?.username).toEqual(default_username);
    });
    it("doesn't add when default admin exist", async () => {
        await (0, handleAdminAccount_1.default)();
        expect((await users.index()).length).toBe(totalAccounts + 1);
    });
});
