import app from "../../server";
import supertest from "supertest";
import handleAdminAccount from "../../utilities/handleAdminAccount";
import dotenv from "dotenv";
import { AuthorizedUser, User, UserStore } from "../../models/user";
import { ProductStore } from "../../models/product";

dotenv.config();

const users = new UserStore();
const products = new ProductStore();

const admin_username = process.env.DEFAULT_ADMIN_USER as string;
const admin_password = process.env.DEFAULT_ADMIN_PASSWORD as string;
let admin_id: number;
let admin_jwt: string;
let product_id: number;
let total_products_before_start: number;

const request = supertest(app);

describe("Test suite for products endpoints", () => {
    beforeAll(async () => {
        await products.create({ name: "Logitech blabla", price: 150, category: "pc" });
        total_products_before_start = (await products.index()).length;
        await handleAdminAccount();
        admin_id = ((await users.getByUsername(admin_username)) as User).id;
        admin_jwt = ((await users.authenticate(admin_id, admin_password)) as AuthorizedUser).token;
    });

    describe("Test suite for POST Create endpoint", () => {
        it("replies to no token correctly", async () => {
            const res = await request.post("/products");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });

        it("replies to unauthorized access correctly", async () => {
            const res = await request.post("/products").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });

        it("replies to missing parameters correctly", async () => {
            const res = await request.post("/products").send({ token: admin_jwt });
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: "missing parameters", parameters: ["name", "price", "category"] });
        });

        it("replies to valid requests", async () => {
            const res = await request.post("/products").send({ token: admin_jwt, name: "iPhone 69", price: 696969, category: "mobiles" });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            product_id = res.body.product.id;
            expect(res.body.product).toEqual({ id: product_id, name: "iPhone 69", price: 696969, category: "mobiles" });
        });
    });

    describe("Test suite for GET Index endpoint", () => {
        it("works without category", async () => {
            const res = await request.get("/products");
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(total_products_before_start + 1);
        });

        it("works with category", async () => {
            const res = await request.get("/products").send({ category: "pc" });
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe("Logitech blabla");
            expect(res.body[0].price).toBe(150);
            expect(res.body[0].category).toBe("pc");
        });
    });

    describe("Test suite for GET Show endpoint", () => {
        it("works when given a wrong id", async () => {
            const res = await request.get("/products/123123").send();
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("product not found");
        });

        it("works when given a correct id", async () => {
            const res = await request.get("/products/" + product_id);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.product).toEqual({ id: product_id, name: "iPhone 69", price: 696969, category: "mobiles" });
        });
    });

    describe("Test suite for DELETE endpoint", () => {
        it("replies to no token correctly", async () => {
            const res = await request.delete("/products/123");
            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual({ message: "token needed" });
        });

        it("replies to unauthorized access correctly", async () => {
            const res = await request.delete("/products/123").send({ token: "123123" });
            expect(res.statusCode).toBe(403);
            expect(res.body).toEqual({ message: "access denied" });
        });

        it("replies to wrong id", async () => {
            const res = await request.delete("/products/123").send({ token: admin_jwt });
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: "product not found" });
        });

        it("replies to valid requests", async () => {
            const res = await request.delete("/products/" + product_id).send({ token: admin_jwt });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("success");
            expect(res.body.deletedProduct).toEqual({ id: product_id, name: "iPhone 69", price: 696969, category: "mobiles" });
            expect((await products.index()).length).toBe(total_products_before_start);
        });
    });
});
