import { Product, ProductStore } from "../product";

const products = new ProductStore();

let productId: number;
let total_products_before_start: number;

describe("Testing ProductStore Model", () => {
    beforeAll(async () => {
        total_products_before_start = (await products.index()).length;
    });

    it("has all CRUD methods defined", () => {
        expect(products.index).toBeDefined();
        expect(products.create).toBeDefined();
        expect(products.show).toBeDefined();
        expect(products.delete).toBeDefined();
    });

    it("creates a new product", async () => {
        const product = await products.create({ name: "iPhone 69", price: 696969, category: "mobile" });
        productId = product.id;
        expect(product.id).toBe(productId);
        expect(product.name).toBe("iPhone 69");
        expect(product.price).toBe(696969);
        expect(product.category).toBe("mobile");
        expect((await products.index()).length).toBe(total_products_before_start + 1);
        await products.create({ name: "Zeyad's thoughts", price: 0, category: "garbage" }); // For next test
    });

    it("index method shows total products when no category given", async () => {
        const myProducts = await products.index();
        expect(Array.isArray(myProducts)).toBe(true);
        expect(myProducts.length).toBe(total_products_before_start + 2);
    });

    it("index method shows products of a category", async () => {
        const myProducts = await products.index("garbage");
        expect(Array.isArray(myProducts)).toBe(true);
        expect(myProducts.length).toBe(1);
        expect(myProducts[0].name).toBe("Zeyad's thoughts");
        expect(myProducts[0].price).toBe(0);
        expect(myProducts[0].category).toBe("garbage");
        await products.delete(myProducts[0].id); // Just to keep total_products_before_start easier to track
    });

    it("shows a product", async () => {
        const product = (await products.show(productId)) as Product;
        expect(product.id).toBe(productId);
        expect(product.name).toBe("iPhone 69");
        expect(product.price).toBe(696969);
        expect(product.category).toBe("mobile");
    });

    it("gets a product by name", async () => {
        const product = (await products.getByName("iPhone 69")) as Product;
        expect(product.id).toBe(productId);
        expect(product.name).toBe("iPhone 69");
        expect(product.price).toBe(696969);
        expect(product.category).toBe("mobile");
    });

    it("deletes a product", async () => {
        const product = (await products.delete(productId)) as Product;
        expect(product.id).toBe(productId);
        expect(product.name).toBe("iPhone 69");
        expect(product.price).toBe(696969);
        expect(product.category).toBe("mobile");
        expect((await products.index()).length).toBe(total_products_before_start);
    });
});
