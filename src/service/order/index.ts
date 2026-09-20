import { Address, Prisma, ShippingMethod } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { CalculateOrderAmountResult } from "../pricing"


export const orderService = {
    async findAll() {
        return prisma.order.findMany()
    },
    async create(tx: Prisma.TransactionClient, userId: string, address: Address, shippingMethod: ShippingMethod, price: CalculateOrderAmountResult) {
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
                    totalAmount: price.totalAmount
                }
            }
        )
    }
}