import { UserStore } from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const users = new UserStore();

const handleAdminAccount = async () => {
    try {
        const username = process.env.DEFAULT_ADMIN_USER as unknown as string;
        const password = process.env.DEFAULT_ADMIN_PASSWORD as unknown as string;
        const user = await users.getByUsername(username);
        if (user === undefined) {
            await users.create({ username, password, firstName: "Default", lastName: "Admin", isAdmin: true });
            if (process.env.ENV != "test") console.log("Created default admin account according to ENV variables.");
        } else {
            if (process.env.ENV != "test") console.log("Default admin account already exists.");
        }
    } catch (error) {
        console.log(`There was an error with handling default admin account. Error: ${error}`);
    }
};

export default handleAdminAccount;
