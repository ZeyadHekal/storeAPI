"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const order_1 = require("../../models/order");
const order_products_1 = require("../../models/order_products");
const product_1 = require("../../models/product");
const user_1 = require("../../models/user");
const server_1 = __importDefault(require("../../server"));
const users = new user_1.UserStore();
const products = new product_1.ProductStore();
const orders = new order_1.OrderStore();
const orders_products = new order_products_1.OrderProductsStore();
const request = (0, supertest_1.default)(server_1.default);
let myUser;
const myProducts = [];
const myOrders = [];
describe("Testing popular_products route", () => {
    beforeAll(async () => {
        myUser = await users.create({ username: "Popular products test", firstName: "Zeyad", lastName: "Hekal", password: "123123" });
        // This will create 5 products
        for (let i = 0; i < 5; i++) {
            myProducts[i] = await products.create({ name: "Product" + i, price: 999, category: "testProducts" });
        }
        // This will create 5 orders, order 1 with 1 product to order 5 with 5 products
        // so we can know that product 5 is repeated 5 times, etc.
        for (let i = 0; i < 5; i++) {
            myOrders[i] = await orders.create(myUser.id);
            for (let j = i; j < 5; j++) {
                // add the products each with 1 quantity because it will affect the test
                // as popular products take quantities into consideration
                await orders_products.create(myOrders[i].id, { id: myProducts[j].id, quantity: 1 });
            }
            // set order as completed because popular products only count from completed orders
            await orders.complete(myOrders[i].id);
        }
        // Create an active order with 99 quantity product to make sure active orders do not count
        const order = await orders.create(myUser.id);
        await orders_products.create(order.id, { id: myProducts[1].id, quantity: 99 });
    });
    it("correctly responds with most 5 popular products", async () => {
        const res = await request.get("/services/popular_products");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(5);
        for (let i = 0; i < 5; i++) {
            expect(res.body[5 - i - 1]).toEqual({ id: myProducts[i].id, name: `Product${i}`, price: 999, category: "testProducts", quantity: i + 1 });
        }
    });
});
