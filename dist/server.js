"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const address = `localhost:${process.env.SERVER_PORT}`;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
app.use((0, cookie_parser_1.default)());
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)());
const router_1 = __importDefault(require("./router"));
app.use(router_1.default);
app.get("/", function (req, res) {
    res.send("Welcome to Zeyad's first back-end online store!");
});
app.listen(process.env.SERVER_PORT, function () {
    console.log(`starting app on: ${address}`);
});
const handleAdminAccount_1 = __importDefault(require("./utilities/handleAdminAccount"));
if (process.env.ENV != "test")
    (0, handleAdminAccount_1.default)();
exports.default = app;
