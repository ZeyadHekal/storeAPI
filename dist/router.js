"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Router = express_1.default.Router();
const router_1 = __importDefault(require("./handlers/router"));
Router.use(router_1.default);
const router_2 = __importDefault(require("./services/router"));
Router.use(router_2.default);
exports.default = Router;
