import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma"; // ปรับ path ให้ตรงกับโปรเจกต์
import { Role } from "../src/generated/prisma/enums";
import app from "../src/app"; // ปรับ path ให้ตรงกับโปรเจกต์
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Cart Item API (Integration Test)", () => {
    let userToken: string;
    let userId: string;
    let cartId: string;
    let variantId: string;
    let cartItemId: string;

    beforeEach(async () => {
        // --------------------------------
        // 1. Cleanup
        // --------------------------------
        await prisma.inventoryTransaction.deleteMany();
        await prisma.inventory.deleteMany();
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();

        await prisma.productVariant.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();

        // --------------------------------
        // 2. Create User & Token
        // --------------------------------
        const password = await bcrypt.hash("123456", 10);
        const user = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                username: `test-${Date.now()}`,
                password: password,
                role: Role.USER,
                isActive: true,
            },
        });

        userId = user.id;
        const config = { JWT_SECRET: process.env.JWT_SECRET || "change-this-in-production" };

        userToken = jwt.sign(
            {
                sub: user.id,
                username: user.username,
                role: user.role,
            },
            config.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // --------------------------------
        // 3. Create Product & Variant & Inventory (Stock = 10)
        // --------------------------------
        const category = await prisma.category.create({
            data: {
                nameEn: "Shirt",
                nameTh: "เสื้อ",
                slug: `shirt-${Date.now()}`,
            },
        });

        const product = await prisma.product.create({
            data: {
                name: "Test Shirt",
                categoryId: category.id,
            },
        });

        const variant = await prisma.productVariant.create({
            data: {
                productId: product.id,
                sku: `SKU-${Date.now()}`,
                price: 500,
                unit: "ชิ้น",
                color: "Black",
                size: "M",
                isActive: true,
                inventory: {
                    create: {
                        quantity: 10, // มีสต็อก 10 ชิ้น
                        updatedAt: new Date(),
                    },
                },
            },
        });

        variantId = variant.id;

        // --------------------------------
        // 4. Create Initial Cart & CartItem
        // --------------------------------
        const cart = await prisma.cart.create({
            data: {
                userId: user.id,
            },
        });

        cartId = cart.id;

        const cartItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                variantId: variant.id,
                quantity: 2,
            },
        });

        cartItemId = cartItem.id;
    });

    // ============================================
    // FIND ALL
    // ============================================
    it("GET /find-all - should return all items in cart", async () => {
        const res = await request(app)
            .get("/api/cart-item/find-all")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(cartItemId);
        expect(res.body[0].quantity).toBe(2);
    });

    // ============================================
    // FIND BY ID
    // ============================================
    it("GET /find-by-id/:itemId - should return cart item detail", async () => {
        const res = await request(app)
            .get(`/api/cart-item/find-by-id/${cartItemId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(cartItemId);
        expect(res.body.quantity).toBe(2);
    });

    it("GET /find-by-id/:itemId - should return 404 if item does not exist", async () => {
        const res = await request(app)
            .get("/api/cart-item/find-by-id/00000000-0000-0000-0000-000000000000")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(404);
    });

    // ============================================
    // CREATE (Add to cart)
    // ============================================
    it("POST /create - should upsert and increment quantity", async () => {
        // เพิ่ม variant เดิมที่มีอยู่แล้ว 2 ชิ้น เข้าไปอีก 3 ชิ้น (ควรกลายเป็น 5)
        const res = await request(app)
            .post("/api/cart-item/create")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                variantId,
                quantity: 3,
            });

        expect(res.status).toBe(200);

        // ตรวจ DB จริง
        const itemInDb = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
        });
        expect(itemInDb?.quantity).toBe(5);
    });

    // ============================================
    // UPDATE (Change quantity in cart page)
    // ============================================
    it("PUT /update/:itemId - should update quantity when stock is sufficient", async () => {
        const res = await request(app)
            .put(`/api/cart-item/update/${cartItemId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                quantity: 8, // เปลี่ยนเป็น 8 (สต็อกมี 10)
            });

        expect(res.status).toBe(200);

        const itemInDb = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
        });
        expect(itemInDb?.quantity).toBe(8);
    });

    it("PUT /update/:itemId - should reject when quantity exceeds stock", async () => {
        const res = await request(app)
            .put(`/api/cart-item/update/${cartItemId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                quantity: 15, // เกินสต็อกที่มีอยู่ 10
            });

        expect(res.status).toBe(400);

        // ค่าใน DB ต้องไม่เปลี่ยน (ยังเป็น 2 เท่าเดิม)
        const itemInDb = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
        });
        expect(itemInDb?.quantity).toBe(2);
    });

    // ============================================
    // DELETE
    // ============================================
    it("DELETE /delete/:itemId - should remove cart item", async () => {
        const res = await request(app)
            .delete(`/api/cart-item/delete/${cartItemId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);

        const itemInDb = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
        });
        expect(itemInDb).toBeNull();
    });


    it("CONCURRENCY: should handle multiple simultaneous 'add to cart' requests without duplicate rows or wrong quantity", async () => {
        // สต็อกมี 10 ชิ้น
        // ยิง Request พร้อมกัน 5 ครั้ง ครั้งละ 1 ชิ้น
        const requests = Array.from({ length: 5 }).map(() =>
            request(app)
                .post("/api/cart-item/create")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    variantId,
                    quantity: 1,
                })
        );

        // ยิงพร้อมกันแบบ Parallel
        const responses = await Promise.all(requests);

        // ทุก Request ต้องได้ Status 200
        responses.forEach((res) => {
            expect(res.status).toBe(200);
        });

        // เช็กใน Database
        const cartItems = await prisma.cartItem.findMany({
            where: { cartId, variantId },
        });

        // 1. ต้องไม่มี Record ซ้ำกัน (ต้องมีแค่ 1 แถวเท่านั้น)
        expect(cartItems).toHaveLength(1);

        // 2. จำนวนรวมต้องถูกต้อง (2 ชิ้นที่มีอยู่เดิม + 5 ชิ้นที่กดเพิ่มพร้อมกัน = 7 ชิ้น)
        expect(cartItems[0].quantity).toBe(7);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});