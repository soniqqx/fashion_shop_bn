import { Prisma } from "../../generated/prisma/client"
import { CheckoutCartItem } from "../cart"


export const orderItemService = {
    async createMany(tx: Prisma.TransactionClient, orderId: string, items: CheckoutCartItem[]) {
        return tx.orderItem.createMany(
            {
                data: items.map((item) => ({
                    orderId,
                    variantId: item.variantId,
                    productName: item.variant.product.name,
                    quantity: item.quantity,
                    unitPrice: item.variant.price,
                })),
            }
        )
    }
}