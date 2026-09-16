import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { CreateCartItemBody, UpdateCartItemBody } from "../../schemas/cartItem";
import { getOrCreateActiveCartId } from "./helper";

export const cartItemService = {
    async findAll(userId: string) {
        const cartId = await getOrCreateActiveCartId(userId);

        return prisma.cartItem.findMany({
            where: {
                cartId,
            },
            include: {
                variant: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                isActive: true
                            }
                        }
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },
    async findById(userId: string, itemId: string) {

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: { userId }
            },
            include: {
                variant: {
                    include: { product: true }
                }
            }
        });

        if (!cartItem) {
            throw new AppError(404, "Cart item not found");
        }

        return cartItem;
    },
    async create(userId: string, data: CreateCartItemBody) {

        const cartId = await getOrCreateActiveCartId(userId);

        return prisma.cartItem.upsert({
            where: {
                cartId_variantId: {
                    cartId,
                    variantId: data.variantId,
                },
            },
            update: {
                quantity: { increment: data.quantity },
            },
            create: {
                cartId,
                variantId: data.variantId,
                quantity: data.quantity,
            },
        });
    },

    async update(userId: string, itemId: string, data: UpdateCartItemBody) {
        return await prisma.$transaction(async (tx) => {

            const cartId = await getOrCreateActiveCartId(userId, tx);
            const cartItem = await tx.cartItem.findFirst({
                where: {
                    id: itemId,
                    cartId,
                    cart: { userId }
                },
                select: { id: true, variantId: true }
            });

            if (!cartItem) {
                throw new AppError(404, "Cart item not found");
            }

            const inventory = await tx.inventory.findFirst({
                where: { variantId: cartItem.variantId },
                select: { quantity: true }
            });

            if (!inventory) {
                throw new AppError(404, "Inventory not found");
            }

            if (data.quantity > inventory.quantity) {
                throw new AppError(400, "Insufficient stock");
            }

            return tx.cartItem.update({
                where: { id: itemId },
                data: { quantity: data.quantity }
            });
        });
    },

    async delete(userId: string, itemId: string) {
        // ใช้ deleteMany ร่วมกับ Filter เพื่อลบใน Query เดียวอย่างปลอดภัย
        const cartId = await getOrCreateActiveCartId(userId);

        const result = await prisma.cartItem.deleteMany({
            where: {
                id: itemId,
                cartId,
                cart: { userId }
            }
        });

        if (result.count === 0) {
            throw new AppError(404, "Cart item not found or unauthorized");
        }

        return { message: "Cart item deleted successfully" };
    }
}