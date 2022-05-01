"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("../order");
const order_products_1 = require("../order_products");
const product_1 = require("../product");
const user_1 = require("../user");
const users = new user_1.UserStore();
const products = new product_1.ProductStore();
const orders = new order_1.OrderStore();
const order_products = new order_products_1.OrderProductsStore();
let myUser;
let myProduct;
let myOrder;
describe("Test suite for order_products Model", () => {
    beforeAll(async () => {
        myUser = await users.create({ username: "order_products_test", firstName: "a", lastName: "b", password: "123" });
        myProduct = await products.create({ name: "RTX 9999Ti Super", price: 123, category: "graphics card" });
        myOrder = await orders.create(myUser.id);
    });
    it("adds products to an order", async () => {
        const newProduct = await order_products.create(myOrder.id, { id: myProduct.id, quantity: 99 });
        expect(newProduct.id).toBe(myProduct.id);
        expect(newProduct.quantity).toBe(99);
    });
    it("index all products in an order", async () => {
        const myProducts = await order_products.index(myOrder.id);
        expect(Array.isArray(myProducts)).toBe(true);
        expect(myProducts.length).toBe(1);
        expect(myProducts[0].id).toBe(myProduct.id);
        expect(myProducts[0].quantity).toBe(99);
    });
    it("shows a product in an order", async () => {
        const result = (await order_products.show(myOrder.id, myProduct.id));
        expect(result.id).toBe(myProduct.id);
        expect(result.quantity).toBe(99);
    });
    it("deletes a product from an order", async () => {
        const result = (await order_products.delete(myOrder.id, myProduct.id));
        expect(result.id).toBe(myProduct.id);
        expect(result.quantity).toBe(99);
        const newProducts = await order_products.index(myOrder.id);
        expect(Array.isArray(newProducts)).toBe(true);
        expect(newProducts).toEqual([]);
    });
});
