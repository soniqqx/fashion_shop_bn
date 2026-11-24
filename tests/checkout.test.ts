import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { checkout } from "../src/service/checkout";
import { PaymentStatus, Role, ShippingMethod, TransactionType } from "../src/generated/prisma/enums";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("checkout service", () => {
    let userId: string;
    let userToken: string;
    let addressId: string;
    let cartItemId: string;
    let inventoryId: string;
    let reserveReasonId: string;

    beforeEach(async () => {
        await prisma.inventoryTransaction.deleteMany();
        await prisma.orderStatusLog.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.inventory.deleteMany();
        await prisma.productVariant.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.address.deleteMany();
        await prisma.inventoryTransactionReason.deleteMany();
        await prisma.user.deleteMany();

        const unique = Date.now().toString();

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
        userId = user.id;

        const address = await prisma.address.create({
            data: {
                userId,
                recipientName: "Test Customer",
                phone: "0812345678",
                addressLine: "1 Test Road",
                district: "Test District",
                province: "Bangkok",
                postalCode: "10100",
            },
        });
        addressId = address.id;

        const category = await prisma.category.create({
            data: { nameTh: "เสื้อ", nameEn: "Shirt", slug: `shirt-${unique}` },
        });
        const product = await prisma.product.create({
            data: { name: "Checkout Shirt", categoryId: category.id },
        });
        const variant = await prisma.productVariant.create({
            data: {
                productId: product.id,
                sku: `CHECKOUT-${unique}`,
                price: 200,
                unit: "ชิ้น",
                color: "Black",
                size: "M",
                inventory: { create: { quantity: 10, updatedAt: new Date() } },
            },
            include: { inventory: true },
        });
        inventoryId = variant.inventory!.id;

        const cart = await prisma.cart.create({ data: { userId } });
        const cartItem = await prisma.cartItem.create({
            data: { cartId: cart.id, variantId: variant.id, quantity: 2 },
        });
        cartItemId = cartItem.id;

        const reserveReason = await prisma.inventoryTransactionReason.create({
            data: {
                code: "RESERVE",
                name: "Reserve stock for checkout",
                transactionType: TransactionType.OUT,
            },
        });
        reserveReasonId = reserveReason.id;
    });

    it("creates an order and reserves stock for selected cart items", async () => {
        const order = await checkout(userId, {
            cartItemId: [cartItemId],
            addressId,
            shippingMethod: ShippingMethod.STANDARD,
        });

        expect(order.order.userId).toBe(userId);
        expect(Number(order.order.subtotalAmount)).toBe(400);
        expect(Number(order.order.shippingFee)).toBe(40);
        expect(Number(order.order.totalAmount)).toBe(440);
        expect(order.payment.orderId).toBe(order.order.id);
        expect(order.payment.status).toBe(PaymentStatus.PENDING);
        expect(Number(order.payment.amount)).toBe(440.00);

        await expect(prisma.cartItem.findUnique({ where: { id: cartItemId } }))
            .resolves.toBeNull();
        await expect(prisma.inventory.findUnique({ where: { id: inventoryId } }))
            .resolves.toMatchObject({ quantity: 8 });
        await expect(prisma.orderItem.findMany({ where: { orderId: order.order.id } }))
            .resolves.toMatchObject([{ variantId: expect.any(String), quantity: 2, productName: "Checkout Shirt" }]);
        await expect(prisma.orderStatusLog.findMany({ where: { orderId: order.order.id } }))
            .resolves.toMatchObject([{ toStatus: "PENDING", changedBy: userId }]);
        await expect(prisma.inventoryTransaction.findMany({ where: { reasonId: reserveReasonId } }))
            .resolves.toMatchObject([{
                inventoryId,
                type: "OUT",
                quantity: 2,
                beforeQuantity: 10,
                afterQuantity: 8,
            }]);
    });

    it("rolls back all changes when stock is insufficient", async () => {
        await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity: 11 } });

        await expect(checkout(userId, {
            cartItemId: [cartItemId],
            addressId,
            shippingMethod: ShippingMethod.EXPRESS,
        })).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("Insufficient stock") });

        await expect(prisma.order.count()).resolves.toBe(0);
        await expect(prisma.inventory.findUnique({ where: { id: inventoryId } }))
            .resolves.toMatchObject({ quantity: 10 });
        await expect(prisma.cartItem.findUnique({ where: { id: cartItemId } }))
            .resolves.toMatchObject({ quantity: 11 });
        await expect(prisma.inventoryTransaction.count()).resolves.toBe(0);
    });

    it("does not create an order when the address does not belong to the user", async () => {
        await expect(checkout(userId, {
            cartItemId: [cartItemId],
            addressId: "00000000-0000-0000-0000-000000000000",
            shippingMethod: ShippingMethod.STANDARD,
        })).rejects.toMatchObject({ statusCode: 404, message: "Address not found" });

        await expect(prisma.order.count()).resolves.toBe(0);
        await expect(prisma.inventory.findUnique({ where: { id: inventoryId } }))
            .resolves.toMatchObject({ quantity: 10 });
        await expect(prisma.cartItem.findUnique({ where: { id: cartItemId } }))
            .resolves.not.toBeNull();
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
