"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("../order");
const user_1 = require("../user");
const orders = new order_1.OrderStore();
const users = new user_1.UserStore();
let myUserId;
let myOrderId;
let total_numbers_before_start;
describe("Testing orderStore Model", () => {
    beforeAll(async () => {
        myUserId = (await users.create({ username: "user_for_orders", firstName: "Zeyad", lastName: "Hekal", password: "1234" })).id;
        total_numbers_before_start = (await orders.index()).length;
    });
    afterAll(async () => {
        await users.delete(myUserId);
    });
    it("has all CRUD methods defined", () => {
        expect(orders.index).toBeDefined();
        expect(orders.create).toBeDefined();
        expect(orders.show).toBeDefined();
        expect(orders.delete).toBeDefined();
    });
    it("index method works", async () => {
        const myOrders = await orders.index();
        expect(Array.isArray(myOrders)).toBe(true);
        total_numbers_before_start = myOrders.length;
    });
    it("creates a new order", async () => {
        const order = await orders.create(myUserId);
        myOrderId = order.id;
        expect(order.id).toBe(myOrderId);
        expect(order.status).toBe("active");
        expect(parseInt(order.user_id)).toBe(myUserId);
        expect((await orders.index()).length).toBe(total_numbers_before_start + 1);
    });
    it("shows an order", async () => {
        const order = (await orders.show(myOrderId));
        expect(order.id).toBe(myOrderId);
        expect(order.status).toBe("active");
        expect(parseInt(order.user_id)).toBe(myUserId);
    });
    it("sets an order as complete", async () => {
        const order = (await orders.complete(myOrderId));
        expect(order.id).toBe(myOrderId);
        expect(order.status).toBe("completed");
        expect(parseInt(order.user_id)).toBe(myUserId);
    });
    it("deletes an order", async () => {
        const order = (await orders.delete(myOrderId));
        expect(order.id).toBe(myOrderId);
        expect(order.status).toBe("completed");
        expect(parseInt(order.user_id)).toBe(myUserId);
        expect((await orders.index()).length).toBe(total_numbers_before_start);
    });
});
