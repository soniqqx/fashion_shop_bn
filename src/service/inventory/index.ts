import { CartItem, Prisma } from "../../generated/prisma/client"
import { AppError } from "../../lib/errors"
import { prisma } from "../../lib/prisma"

export const inventoryService = {
    async findAll() {
        return prisma.inventory.findMany()
    },
    async findById(id: string) {
        return prisma.inventory.findFirst({
            where: { id },
            include: {
                variant: {
                    include: {
                        product: true
                    }
                },
                inventoryTransaction: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                }
            }
        })
    },
    async reserve(tx: Prisma.TransactionClient, items: CartItem[]) {
        const reservedItems = [];

        for (const item of items) {

            const inventory = await tx.inventory.findUnique({
                where: {
                    variantId: item.variantId,
                },
                include: {
                    variant: true
                }
            });

            if (!inventory) {
                throw new AppError(
                    404,
                    `Inventory not found for variant ${item.variantId}`,
                );
            }

            const beforeQuantity = inventory.quantity;

            const result = await tx.inventory.updateMany({
                where: {
                    id: inventory.id,
                    quantity: {
                        gte: item.quantity,
                    },
                },
                data: {
                    quantity: {
                        decrement: item.quantity,
                    },
                },
            });

            if (result.count === 0) {
                throw new AppError(
                    409,
                    `Insufficient stock for variant ${item.variantId}`,
                );
            }

            const afterQuantity =
                beforeQuantity - item.quantity;

            reservedItems.push({
                inventoryId: inventory.id,
                variantId: item.variantId,
                quantity: item.quantity,
                beforeQuantity,
                afterQuantity,
                unitName: inventory.variant.unit,
            });
        }

        return reservedItems;
    }
}

export type ReserveInventoryResult = Awaited<
    ReturnType<typeof inventoryService.reserve>
>;
