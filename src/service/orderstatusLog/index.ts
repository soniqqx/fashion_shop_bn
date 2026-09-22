import { OrderStatus, Prisma } from "../../generated/prisma/client"


export const orderStatusLogService = {
    async create(tx: Prisma.TransactionClient, userId: string, orderId: string, status: OrderStatus) {
        return tx.orderStatusLog.create(
            {
                data: {
                    orderId,
                    changedBy: userId,
                    toStatus: status
                },
            }
        )
    }
}
