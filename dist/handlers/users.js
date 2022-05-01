"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const users = new user_1.UserStore();
const index = async (_req, res) => {
    try {
        const results = await users.index();
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: "error", error });
    }
};
const show = async (req, res) => {
    try {
        const result = await users.show(parseInt(req.params.id));
        if (result === undefined) {
            return res.status(400).send({ message: "user doesn't exist" });
        }
        res.status(200).json({ message: "success", user: result });
    }
    catch (error) {
        res.status(500).json({ message: "error", error });
    }
};
const create = async (req, res) => {
    try {
        if (req.body.username && req.body.firstName && req.body.lastName && req.body.password) {
            const user = await users.getByUsername(req.body.username);
            if (user === undefined) {
                const result = await users.create({ username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, password: req.body.password });
                res.json(result);
            }
            else {
                res.status(400).json({ message: "There is already a user with this username!" });
            }
        }
        else {
            res.status(400).json({ message: "missing parameters", parameters: ["username", "password", "firstName", "lastName"] });
        }
    }
    catch (error) {
        res.status(500).json({ message: "error", error });
    }
};
const _delete = async (req, res) => {
    try {
        const user = await users.show(parseInt(req.params.id));
        if (user !== undefined) {
            const deletedUser = await users.delete(parseInt(req.params.id));
            res.status(200).json({ message: "success", deletedUser });
        }
        else {
            return res.status(400).json({ message: "user doesn't exist" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "error", error });
    }
};
const authenticate = async (req, res) => {
    try {
        if (req.params.id && req.body.password) {
            const user = await users.show(parseInt(req.params.id));
            if (user) {
                const myUser = (await users.authenticate(user.id, req.body.password));
                if (myUser) {
                    const { token, ...UserData } = myUser;
                    res.status(200).json({ message: "success", token: token, data: UserData });
                }
                else {
                    res.status(400).json({ message: "wrong password" });
                }
            }
            else {
                res.status(400).json({ message: "user doesn't exist" });
            }
        }
        else {
            res.status(400).json({ message: "missing parameters", parameters: ["password"] });
        }
    }
    catch (error) {
        res.status(500).json({ message: "error", error });
    }
};
const usersRoute = { index, show, create, _delete, authenticate };
exports.default = usersRoute;
