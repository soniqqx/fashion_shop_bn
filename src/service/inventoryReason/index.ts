import { InventoryTransactionReason, Prisma, TransactionType } from "../../generated/prisma/client"
import { AppError } from "../../lib/errors"
import { prisma } from "../../lib/prisma"
import { CreateInventoryReasonBody, UpdateInventoryReasonBody } from "../../schemas/inventoryReason"

export const inventoryReasonService = {
    async findAll() {
        return prisma.inventoryTransactionReason.findMany()
    },
    async findById(id: string) {
        return prisma.inventoryTransactionReason.findFirst({
            where: { id }
        })
    },
    async findByCode(
        tx: Prisma.TransactionClient,
        code: string,
        transactionType: TransactionType,
    ) {
        if (!code || typeof code !== "string") {
            throw new AppError(400, 'Not found code reason')
        }
        const reason = await tx.inventoryTransactionReason.findUnique({
            where: { code },
        });

        if (!reason || !reason.isActive || reason.transactionType !== transactionType) {
            throw new AppError(
                500,
                `Active ${transactionType} inventory transaction reason '${code}' not found`
            );
        }

        return reason;
    },
    async create(data: CreateInventoryReasonBody) {
        return prisma.inventoryTransactionReason.create(
            { data }
        )
    },
    async update(id: string, data: UpdateInventoryReasonBody) {
        return prisma.inventoryTransactionReason.update({
            where: { id },
            data: data
        })
    },
    async delete(id: string): Promise<InventoryTransactionReason> {
        return prisma.inventoryTransactionReason.update({
            where: { id },
            data: { isActive: false }
        })
    }
}
