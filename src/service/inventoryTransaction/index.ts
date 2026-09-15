import { Inventory } from "../../generated/prisma/client"
import { AppError } from "../../lib/errors"
import { prisma } from "../../lib/prisma"
import { CreateInventoryTransactionBody } from "../../schemas/inventoryTransaction"

export const inventoryTransactionService = {
    async findAll() {
        return prisma.inventoryTransaction.findMany({
            include: {
                user: true,
                reason: true,
                inventory: {
                    include: {
                        variant: true
                    }
                }
            }
        })
    },
    async findById(id: string) {
        return prisma.inventoryTransaction.findFirst({
            where: { id },
            include: {
                user: true,
                reason: true,
                inventory: {
                    include: {
                        variant: true
                    }
                }
            }
        })
    },
    async createTransaction(
        data: CreateInventoryTransactionBody,
        userId?: string
    ) {
        return prisma.$transaction(async (tx) => {

            // 1. Get Reason
            const reason =
                await tx.inventoryTransactionReason.findUnique({
                    where: {
                        id: data.reasonId,
                    },
                });

            if (!reason) {
                throw new AppError(
                    404,
                    "Inventory transaction reason not found"
                );
            }

            if (!reason.isActive) {
                throw new AppError(
                    400,
                    "Inventory transaction reason is inactive"
                );
            }


            // 2. Lock Inventory row
            const inventories =
                await tx.$queryRaw<Inventory[]>`
                SELECT *
                FROM inventory
                WHERE id = ${data.inventoryId}
                FOR UPDATE
            `;

            if (inventories.length === 0) {
                throw new AppError(
                    404,
                    "Inventory not found"
                );
            }

            const inventory = inventories[0];


            // 3. Before quantity
            const beforeQuantity =
                inventory.quantity;


            // 4. Calculate after quantity
            const afterQuantity =
                reason.transactionType === "IN"
                    ? beforeQuantity + data.quantity
                    : beforeQuantity - data.quantity;


            // 5. Check stock
            if (afterQuantity < 0) {
                throw new AppError(
                    400,
                    "Insufficient stock"
                );
            }


            // 6. Update Inventory
            await tx.inventory.update({
                where: {
                    id: inventory.id,
                },
                data: {
                    quantity: afterQuantity,
                },
            });


            // 7. Create Transaction
            return tx.inventoryTransaction.create({
                data: {
                    inventoryId: inventory.id,
                    reasonId: reason.id,
                    quantity: data.quantity,
                    type: reason.transactionType,
                    inputUnitName: data.inputUnitName,
                    beforeQuantity,
                    afterQuantity,
                    userId: userId,
                    note: data.note,
                },
            });
        });
    }
}