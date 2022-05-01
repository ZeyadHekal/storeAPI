"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const handleAdminAccount_1 = __importDefault(require("../../utilities/handleAdminAccount"));
const server_1 = __importDefault(require("../../server"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("../../models/user");
const order_1 = require("../../models/order");
const product_1 = require("../../models/product");
dotenv_1.default.config();
const request = (0, supertest_1.default)(server_1.default);
const users = new user_1.UserStore();
const orders = new order_1.OrderStore();
const products = new product_1.ProductStore();
let myUser;
let myAdminUser;
let myUserOrder;
let myAdminOrder;
let myProduct;
let mySecondProduct;
describe("Test suite for orders endpoints", () => {
    beforeAll(async () => {
        await (0, handleAdminAccount_1.default)();
        myUser = await users.create({ username: "orders-test-user", password: "123123", firstName: "Zeyad", lastName: "Hekal" });
        const adminId = (await users.getByUsername(process.env.DEFAULT_ADMIN_USER)).id;
        myAdminUser = (await users.authenticate(adminId, process.env.DEFAULT_ADMIN_PASSWORD));
        myProduct = await products.create({ name: "Kidney", category: "body part", price: 2000 });
        mySecondProduct = await products.create({ name: "RTX 9999Ti Super Ultra Thin 32k", price: 999999, category: "drugs" });
    });
    describe("Test suite for POST Create", () => {
        it("fails when no token is provided", async () => {
            const res = await request.post("/orders");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.post("/orders").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("success with a normal user account", async () => {
            const res = await request.post("/orders").send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.order.user_id).toBe(myUser.id);
            myUserOrder = res.body.order;
        });
        it("success with an admin account", async () => {
            const res = await request.post("/orders").send({ token: myAdminUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.order.user_id).toBe(myAdminUser.id);
            myAdminOrder = res.body.order;
        });
    });
    describe("Test suite for GET Index endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.get("/orders");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.get("/orders").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("returns only user orders for normal users", async () => {
            const res = await request.get("/orders").send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
        });
        it("returns all orders for an admin account", async () => {
            const res = await request.get("/orders").send({ token: myAdminUser.token });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(1);
        });
    });
    describe("Test suite for GET Show endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.get("/orders/" + myUserOrder.id);
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.get("/orders/" + myUserOrder.id).send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("responds correctly to wrong orderId", async () => {
            const res = await request.get("/orders/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("order doesn't exist");
        });
        it("responds correctly to unauthorized access for normal users", async () => {
            const res = await request.get("/orders/" + myAdminOrder.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("access denied");
        });
        it("correctly shows an order to his normal account owner", async () => {
            const res = await request.get("/orders/" + myUserOrder.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.order.status).toBe("active");
            expect(res.body.order.user_id).toBe(myUser.id);
        });
        it("correctly shows other users' ordres to admin account", async () => {
            const res = await request.get("/orders/" + myUserOrder.id).send({ token: myAdminUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.order.status).toBe("active");
            expect(res.body.order.user_id).toBe(myUser.id);
        });
    });
    describe("Test suite for POST complete endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/complete");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/complete").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("responds correctly to wrong orderId", async () => {
            const res = await request.post("/orders/123123/complete").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("order doesn't exist");
        });
        it("responds correctly to unauthorized access for normal users", async () => {
            const res = await request.post("/orders/" + myAdminOrder.id + "/complete").send({ token: myUser.token });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("access denied");
        });
        it("correctly completes an order for a normal user which he owns", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/complete").send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.order.status).toBe("completed");
            expect(res.body.order.user_id).toBe(myUser.id);
            myUserOrder = await orders.create(myUser.id); // To reset order status for the next test
        });
        it("correctly completes an order for admin user which doesn't own", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/complete").send({ token: myAdminUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.order.status).toBe("completed");
            expect(res.body.order.user_id).toBe(myUser.id);
        });
    });
    describe("Test suite for DELETE endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id);
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id).send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("responds correctly to wrong orderId", async () => {
            const res = await request.delete("/orders/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("order doesn't exist");
        });
        it("responds correctly to unauthorized access for normal users", async () => {
            const res = await request.delete("/orders/" + myAdminOrder.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("access denied");
        });
        it("correctly deletes an order for a normal user which he owns", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedOrder.user_id).toBe(myUser.id);
            myUserOrder = await orders.create(myUser.id); // To create another order instead of the one deleted for the following tests
        });
        it("correctly completes an order for admin user which doesn't own", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id).send({ token: myAdminUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedOrder.user_id).toBe(myUser.id);
            myUserOrder = await orders.create(myUser.id); // To create another order instead of the one deleted for the following tests
        });
    });
    describe("Test suite for order's products POST Create endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/products");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/products").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("responds correctly to wrong orderId", async () => {
            const res = await request.post("/orders/123123/products").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("order doesn't exist");
        });
        it("responds correctly to unauthorized access for normal users", async () => {
            const res = await request.post("/orders/" + myAdminOrder.id + "/products").send({ token: myUser.token });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("access denied");
        });
        it("responds correctly to missing parameters", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/products").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("missing parameters");
        });
        it("responds correctly with a wrong product id", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/products").send({ token: myUser.token, product_id: 123123, quantity: 69 });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("product doesn't exist");
        });
        it("responds correctly with a correct product id", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/products").send({ token: myUser.token, product_id: myProduct.id, quantity: 69 });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
        });
        it("responds correctly to existing product in the order", async () => {
            const res = await request.post("/orders/" + myUserOrder.id + "/products").send({ token: myUser.token, product_id: myProduct.id, quantity: 69 });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("product is already added to this order");
        });
    });
    describe("Test suite for order's products GET Index endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("responds correctly to wrong orderId", async () => {
            const res = await request.get("/orders/123123/products").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("order doesn't exist");
        });
        it("responds correctly to unauthorized access for normal users", async () => {
            const res = await request.get("/orders/" + myAdminOrder.id + "/products").send({ token: myUser.token });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("access denied");
        });
        it("responds correctly to normal user's order owner", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products").send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].id).toBe(myProduct.id);
            expect(res.body[0].quantity).toBe(69);
        });
        it("responds correctly to other users' orders for admin", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products").send({ token: myAdminUser.token });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].id).toBe(myProduct.id);
            expect(res.body[0].quantity).toBe(69);
        });
    });
    describe("Test suite for order's products GET Show endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products/123123");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products/123123").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("responds correctly to wrong orderId", async () => {
            const res = await request.get("/orders/123123/products/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("order doesn't exist");
        });
        it("responds correctly to unauthorized access for normal users", async () => {
            const res = await request.get("/orders/" + myAdminOrder.id + "/products/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("access denied");
        });
        it("responds correctly to wrong product id", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("product doesn't exist");
        });
        it("responds correctly to a correct product id which is not added to the order", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products/" + mySecondProduct.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("product isn't added to this order");
        });
        it("responds correctly to a correct product id which exists in the order", async () => {
            const res = await request.get("/orders/" + myUserOrder.id + "/products/" + myProduct.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.product).toEqual({ id: myProduct.id, quantity: 69 });
        });
    });
    describe("Test suite for order's products DELETE endpoint", () => {
        it("fails when no token is provided", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id + "/products/123123");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });
        it("fails when given a wrong token", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id + "/products/123123").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });
        it("responds correctly to wrong orderId", async () => {
            const res = await request.delete("/orders/123123/products/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("order doesn't exist");
        });
        it("responds correctly to unauthorized access for normal users", async () => {
            const res = await request.delete("/orders/" + myAdminOrder.id + "/products/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("access denied");
        });
        it("responds correctly to wrong product id", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id + "/products/123123").send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("product doesn't exist");
        });
        it("responds correctly to a correct product id that isn't added to the order", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id + "/products/" + mySecondProduct.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("product isn't added to this order");
        });
        it("responds correctly to a correct product id that exists in the order", async () => {
            const res = await request.delete("/orders/" + myUserOrder.id + "/products/" + myProduct.id).send({ token: myUser.token });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedProduct).toEqual({ id: myProduct.id, quantity: 69 });
        });
    });
});
