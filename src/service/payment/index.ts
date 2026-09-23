import { Decimal } from "@prisma/client/runtime/client"
import { PaymentStatus, Prisma } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../lib/errors"


export const paymentService = {
    async create(tx: Prisma.TransactionClient, orderId: string, totalAmount: Decimal) {
        return tx.payment.create(
            {
                data: {
                    orderId,
                    status: PaymentStatus.PENDING,
                    method: '',
                    amount: totalAmount,
                },
            }
        )
    },
    async update(orderId: string, paymentId: string) {
        const payment = await prisma.payment.findUnique({
            where: {
                id: paymentId,
                orderId,
                status: PaymentStatus.PENDING
            },
            include: { order: true }
        })

        if (!payment) {
            throw new AppError(404, 'Not found payment')
        }

        //check expires order
        if (!payment.order.expiresAt) {
            throw new AppError(404, 'ExpiresAt is null')
        }

        const status = payment.order.expiresAt > new Date(Date.now()) ? PaymentStatus.COMPLETED : PaymentStatus.EXPIRED
        const paidAt = status === PaymentStatus.COMPLETED ? new Date(Date.now()) : null
        return await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status,
                paidAt
            }
        })
    }
}