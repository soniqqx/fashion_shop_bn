import { OrderStatus, Prisma } from "../../generated/prisma/client"


export const orderStatusLogService = {
    async create(
        tx: Prisma.TransactionClient,
        userId: string,
        orderId: string,
        status: OrderStatus,
        fromStatus?: OrderStatus | null
    ) {
        return tx.orderStatusLog.create(
            {
                data: {
                    orderId,
                    changedBy: userId,
                    fromStatus: fromStatus ?? null,
                    toStatus: status
                },
            }
        )
    }
}
