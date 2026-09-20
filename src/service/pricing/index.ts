import { Prisma, ShippingMethod } from "../../generated/prisma/client"
import { CheckoutCartItem } from "../cart";

export const pricingService = {
    calculateShippingFee(method: ShippingMethod, subtotal: Prisma.Decimal): Prisma.Decimal {
        switch (method) {
            case ShippingMethod.EXPRESS:
                return new Prisma.Decimal(100);
            case ShippingMethod.STANDARD:
            default:
                return subtotal.gte(500)
                    ? new Prisma.Decimal(0)
                    : new Prisma.Decimal(40);
        }
    },
    async calculateOrderAmount(items: CheckoutCartItem[], shippingMethod: ShippingMethod) {
        const subtotal = items.reduce((total, item) => total.plus(item.variant.price.mul(item.quantity)),
            new Prisma.Decimal(0))
        const shippingFee = this.calculateShippingFee(
            shippingMethod,
            subtotal
        );

        const totalAmount = subtotal.plus(shippingFee);

        return {
            subtotal,
            shippingFee,
            totalAmount
        }
    },

}

export type CalculateOrderAmountResult = Awaited<
    ReturnType<typeof pricingService.calculateOrderAmount>
>;