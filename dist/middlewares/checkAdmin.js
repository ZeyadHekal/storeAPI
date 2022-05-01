"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const checkAdmin = (req, res, next) => {
    if (req.body.token) {
        try {
            const decode = jsonwebtoken_1.default.verify(req.body.token, process.env.JWT_SECRET);
            if (decode && decode.isAdmin) {
                next();
            }
            else {
                res.status(403).json({ message: "access denied" });
            }
        }
        catch (_) {
            res.status(403).json({ message: "access denied" });
        }
    }
    else {
        res.status(401).json({ message: "token needed" });
    }
};
exports.default = checkAdmin;
