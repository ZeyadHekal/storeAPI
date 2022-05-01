import { Order, OrderStore } from "../order";
import { OrderProductsStore, ProductInOrder } from "../order_products";
import { Product, ProductStore } from "../product";
import { AuthorizedUser, UserStore } from "../user";

const users = new UserStore();
const products = new ProductStore();
const orders = new OrderStore();
const order_products = new OrderProductsStore();

let myUser: AuthorizedUser;
let myProduct: Product;
let myOrder: Order;

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
        const result = (await order_products.show(myOrder.id, myProduct.id)) as ProductInOrder;
        expect(result.id).toBe(myProduct.id);
        expect(result.quantity).toBe(99);
    });

    it("deletes a product from an order", async () => {
        const result = (await order_products.delete(myOrder.id, myProduct.id)) as ProductInOrder;
        expect(result.id).toBe(myProduct.id);
        expect(result.quantity).toBe(99);
        const newProducts = await order_products.index(myOrder.id);
        expect(Array.isArray(newProducts)).toBe(true);
        expect(newProducts).toEqual([]);
    });
});
