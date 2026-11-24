import { Address, OrderStatus, Prisma, ShippingMethod } from "../../generated/prisma/client"
import { AppError } from "../../lib/errors"
import { prisma } from "../../lib/prisma"
import { UpdateOrderBody } from "../../schemas/order"
import { orderStatusLogService } from "../orderstatusLog"
import { CalculateOrderAmountResult } from "../pricing"

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],
    [OrderStatus.DELIVERY_FAILED]: [OrderStatus.SHIPPED, OrderStatus.RETURN, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [OrderStatus.RETURN],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.RETURN]: [],
}

export const orderService = {
    async findAll(userId: string) {
        return prisma.order.findMany({
            where: { userId },
            select: {
                id: true,
                totalAmount: true,
                status: true,
                items: {
                    select: {
                        id: true,
                        variantId: true,
                        variant: {
                            select: {
                                sku: true,
                                imageUrl: true,
                                color: true,
                                size: true
                            }
                        },
                        productName: true,
                        quantity: true,
                        unitPrice: true
                    }
                }
            }
        })
    },
    async findById(orderId: string, userId: string) {
        return prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: true,
                statusLogs: true
            }
        })
    },
    async create(tx: Prisma.TransactionClient, userId: string, address: Address, shippingMethod: ShippingMethod, price: CalculateOrderAmountResult) {
        const EXPIRE_MINUTES = 15;
        const expiresAt = new Date(Date.now() + EXPIRE_MINUTES * 60 * 1000);
        return tx.order.create(
            {
                data: {
                    userId,
                    shippingName: address.recipientName,
                    shippingPhone: address.phone,
                    shippingAddressLine: address.addressLine,
                    shippingDistrict: address.district,
                    shippingProvince: address.province,
                    shippingPostalCode: address.postalCode,
                    shippingFee: price.shippingFee,
                    shippingMethod,
                    subtotalAmount: price.subtotal,
                    totalAmount: price.totalAmount,
                    expiresAt: expiresAt
                }
            }
        )
    },
    async update(orderId: string, adminId: string, data: UpdateOrderBody) {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new AppError(404, "Order not found");
            }

            const isStatusChanged = data.status !== undefined && data.status !== order.status;

            if (isStatusChanged && data.status) {
                const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status];
                if (!allowedNext.includes(data.status)) {
                    throw new AppError(
                        400,
                        `Cannot change order status from ${order.status} to ${data.status}`
                    );
                }
            }

            if (isStatusChanged && data.status) {
                await orderStatusLogService.create(
                    tx,
                    adminId,
                    order.id,
                    data.status,
                    order.status
                );
            }

            const shouldSetShippedAt =
                data.status === OrderStatus.SHIPPED && !order.shippedAt;

            return tx.order.update({
                where: { id: orderId },
                data: {
                    ...(data.status !== undefined && { status: data.status }),
                    ...(data.courierName !== undefined && { courierName: data.courierName }),
                    ...(data.trackingNumber !== undefined && { trackingNumber: data.trackingNumber }),
                    ...(data.cancelledReason !== undefined && { cancelledReason: data.cancelledReason }),
                    ...(shouldSetShippedAt && { shippedAt: new Date() }),
                },
                include: {
                    items: true,
                    statusLogs: {
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            });
        });
    },
}
