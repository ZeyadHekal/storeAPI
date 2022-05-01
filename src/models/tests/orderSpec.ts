import { Order, OrderStore } from "../order";
import { UserStore, AuthorizedUser } from "../user";

const orders = new OrderStore();
const users = new UserStore();

let myUserId: number;
let myOrderId: number;
let total_numbers_before_start: number;

describe("Testing orderStore Model", () => {
    beforeAll(async () => {
        myUserId = ((await users.create({ username: "user_for_orders", firstName: "Zeyad", lastName: "Hekal", password: "1234" })) as AuthorizedUser).id;
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
        expect(parseInt(order.user_id as unknown as string)).toBe(myUserId);
        expect((await orders.index()).length).toBe(total_numbers_before_start + 1);
    });

    it("shows an order", async () => {
        const order = (await orders.show(myOrderId)) as Order;
        expect(order.id).toBe(myOrderId);
        expect(order.status).toBe("active");
        expect(parseInt(order.user_id as unknown as string)).toBe(myUserId);
    });

    it("sets an order as complete", async () => {
        const order = (await orders.complete(myOrderId)) as Order;
        expect(order.id).toBe(myOrderId);
        expect(order.status).toBe("completed");
        expect(parseInt(order.user_id as unknown as string)).toBe(myUserId);
    });

    it("deletes an order", async () => {
        const order = (await orders.delete(myOrderId)) as Order;
        expect(order.id).toBe(myOrderId);
        expect(order.status).toBe("completed");
        expect(parseInt(order.user_id as unknown as string)).toBe(myUserId);
        expect((await orders.index()).length).toBe(total_numbers_before_start);
    });
});
