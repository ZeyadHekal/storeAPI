"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const users = new user_1.UserStore();
const handleAdminAccount = async () => {
    try {
        const username = process.env.DEFAULT_ADMIN_USER;
        const password = process.env.DEFAULT_ADMIN_PASSWORD;
        const user = await users.getByUsername(username);
        if (user === undefined) {
            await users.create({ username, password, firstName: "Default", lastName: "Admin", isAdmin: true });
            if (process.env.ENV != "test")
                console.log("Created default admin account according to ENV variables.");
        }
        else {
            if (process.env.ENV != "test")
                console.log("Default admin account already exists.");
        }
    }
    catch (error) {
        console.log(`There was an error with handling default admin account. Error: ${error}`);
    }
};
exports.default = handleAdminAccount;
