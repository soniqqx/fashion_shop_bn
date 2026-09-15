import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { Role } from "../src/generated/prisma/enums";
import app from "../src/app";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Inventory Transaction API", () => {
    let adminToken: string;

    let userId: string;
    let inventoryId: string;
    let inReasonId: string;
    let outReasonId: string;

    beforeEach(async () => {
        // --------------------------------
        // Cleanup
        // --------------------------------


        await prisma.inventoryTransaction.deleteMany();
        await prisma.inventory.deleteMany();
        await prisma.productVariant.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.inventoryTransactionReason.deleteMany();
        await prisma.user.deleteMany();

        // --------------------------------
        // Create User
        // --------------------------------
        const password = await bcrypt.hash("123456", 10);
        const user = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                username: `test-${Date.now()}`,
                password: password,
                role: Role.ADMIN,
                isActive: true,
            },
        });

        userId = user.id;
        const config = { JWT_SECRET: process.env.JWT_SECRET || "change-this-in-production" };

        adminToken = jwt.sign(
            {
                sub: user.id,
                username: user.username,
                role: user.role,
            },
            config.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // --------------------------------
        // Create Category
        // --------------------------------

        const category = await prisma.category.create({
            data: {
                nameEn: "T-Shirt",
                nameTh: "เสื้อเชิ้ต",
                slug: `t-shirt-${Date.now()}`,
            },
        });


        // --------------------------------
        // Create Product
        // --------------------------------

        const product = await prisma.product.create({
            data: {
                name: "Test T-Shirt",
                categoryId: category.id,
            },
        });


        // --------------------------------
        // Create Variant
        // --------------------------------

        const variant = await prisma.productVariant.create({
            data: {
                productId: product.id,
                sku: `TEST-${Date.now()}`,
                price: 100,
                unit: "ชิ้น",
                color: "Black",
                size: "M",
                isActive: true,

                inventory: {
                    create: {
                        quantity: 100,
                        updatedAt: new Date(),
                    },
                },
            },
            include: {
                inventory: true,
            },
        });

        inventoryId = variant.inventory!.id;


        // --------------------------------
        // Create IN Reason
        // --------------------------------

        const inReason =
            await prisma.inventoryTransactionReason.create({
                data: {
                    code: "TEST_IN",
                    name: "รับสินค้า",
                    transactionType: "IN",
                    isActive: true,
                },
            });

        inReasonId = inReason.id;


        // --------------------------------
        // Create OUT Reason
        // --------------------------------

        const outReason =
            await prisma.inventoryTransactionReason.create({
                data: {
                    code: "TEST_OUT",
                    name: "สินค้าชำรุด",
                    transactionType: "OUT",
                    isActive: true,
                },
            });

        outReasonId = outReason.id;
    });


    // ============================================
    // IN
    // ============================================

    it("should increase stock when transaction type is IN", async () => {
        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: inReasonId,
                quantity: 20,
                inputUnitName: "ชิ้น",
                note: "Receive stock",
            });


        expect(response.status).toBe(201);


        // ตรวจ Inventory
        const inventory = await prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },
        });

        expect(inventory?.quantity).toBe(120);


        // ตรวจ Transaction
        const transaction =
            await prisma.inventoryTransaction.findFirst({
                where: {
                    inventoryId,
                },
            });

        expect(transaction).not.toBeNull();

        expect(transaction?.type).toBe("IN");
        expect(transaction?.quantity).toBe(20);
        expect(transaction?.beforeQuantity).toBe(100);
        expect(transaction?.afterQuantity).toBe(120);
        expect(transaction?.inputUnitName).toBe("ชิ้น");
        expect(transaction?.note).toBe("Receive stock");
        expect(transaction?.userId).toBe(userId);
    });


    // ============================================
    // OUT
    // ============================================

    it("should decrease stock when transaction type is OUT", async () => {
        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: outReasonId,
                inputUnitName: "ชิ้น",
                quantity: 30,
                note: "Damaged stock",
            });


        expect(response.status).toBe(201);


        const inventory = await prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },
        });

        expect(inventory?.quantity).toBe(70);


        const transaction =
            await prisma.inventoryTransaction.findFirst({
                where: {
                    inventoryId,
                },
            });

        expect(transaction?.type).toBe("OUT");
        expect(transaction?.quantity).toBe(30);
        expect(transaction?.beforeQuantity).toBe(100);
        expect(transaction?.afterQuantity).toBe(70);
    });


    // ============================================
    // Insufficient Stock
    // ============================================

    it("should reject OUT transaction when stock is insufficient", async () => {
        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: outReasonId,
                inputUnitName: "ชิ้น",
                quantity: 101,
            });


        expect(response.status).toBe(400);


        const inventory = await prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },
        });

        // Stock ต้องไม่เปลี่ยน
        expect(inventory?.quantity).toBe(100);


        // Transaction ต้องไม่ถูกสร้าง
        const transaction =
            await prisma.inventoryTransaction.findFirst({
                where: {
                    inventoryId,
                },
            });

        expect(transaction).toBeNull();
    });


    // ============================================
    // Invalid Quantity
    // ============================================

    it("should reject zero quantity", async () => {
        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: inReasonId,
                inputUnitName: "ชิ้น",
                quantity: 0,
            });


        expect(response.status).toBe(400);
    });


    it("should reject negative quantity", async () => {
        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: inReasonId,
                inputUnitName: "ชิ้น",
                quantity: -10,
            });


        expect(response.status).toBe(400);
    });


    // ============================================
    // Reason
    // ============================================

    it("should reject inactive transaction reason", async () => {
        await prisma.inventoryTransactionReason.update({
            where: {
                id: inReasonId,
            },
            data: {
                isActive: false,
            },
        });


        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: inReasonId,
                inputUnitName: "ชิ้น",
                quantity: 10,
            });


        expect(response.status).toBe(400);


        const inventory = await prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },
        });

        expect(inventory?.quantity).toBe(100);
    });


    it("should reject when reason does not exist", async () => {
        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: "00000000-0000-0000-0000-000000000000",
                inputUnitName: "ชิ้น",
                quantity: 10,
            });


        expect(response.status).toBe(404);
    });


    // ============================================
    // Rollback
    // ============================================

    it("should rollback inventory update when transaction creation fails", async () => {
        // ใช้ reasonId ที่ไม่มีจริง
        const response = await request(app)
            .post("/api/inventory-transaction/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                inventoryId,
                reasonId: "00000000-0000-0000-0000-000000000000",
                inputUnitName: "ชิ้น",
                quantity: 20,
            });


        expect(response.status).toBe(404);


        const inventory = await prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },
        });

        expect(inventory?.quantity).toBe(100);
    });


    // ============================================
    // Concurrency
    // ============================================

    it("should handle concurrent OUT transactions correctly", async () => {
        const requests = Array.from(
            { length: 20 },
            () =>
                request(app)
                    .post("/api/inventory-transaction/create")
                    .set(
                        "Authorization",
                        `Bearer ${adminToken}`
                    )
                    .send({
                        inventoryId,
                        reasonId: outReasonId,
                        inputUnitName: "ชิ้น",
                        quantity: 10,
                    })
        );


        const responses = await Promise.all(requests);


        const successResponses =
            responses.filter(
                (response) => response.status === 201
            );

        const failedResponses =
            responses.filter(
                (response) => response.status === 400
            );


        // Stock มี 100
        // Request ละ 10
        // ดังนั้นสำเร็จได้แค่ 10
        expect(successResponses).toHaveLength(10);

        // อีก 10 ต้อง fail
        expect(failedResponses).toHaveLength(10);


        // ตรวจ Stock สุดท้าย
        const inventory = await prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },
        });


        expect(inventory?.quantity).toBe(0);


        // ตรวจจำนวน Transaction
        const transactionCount =
            await prisma.inventoryTransaction.count({
                where: {
                    inventoryId,
                },
            });


        expect(transactionCount).toBe(10);


        // Stock ต้องไม่ติดลบ
        expect(inventory?.quantity).toBeGreaterThanOrEqual(0);
    });
});


afterAll(async () => {
    await prisma.$disconnect();
});