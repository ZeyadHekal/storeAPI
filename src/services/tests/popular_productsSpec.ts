import supertest from "supertest";
import { Order, OrderStore } from "../../models/order";
import { OrderProductsStore } from "../../models/order_products";
import { Product, ProductStore } from "../../models/product";
import { AuthorizedUser, UserStore } from "../../models/user";
import app from "../../server";

const users = new UserStore();
const products = new ProductStore();
const orders = new OrderStore();
const orders_products = new OrderProductsStore();

const request = supertest(app);

let myUser: AuthorizedUser;
const myProducts: Product[] = [];
const myOrders: Order[] = [];

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
