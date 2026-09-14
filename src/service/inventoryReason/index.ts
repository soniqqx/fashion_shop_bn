import { InventoryTransactionReason } from "../../generated/prisma/client"
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