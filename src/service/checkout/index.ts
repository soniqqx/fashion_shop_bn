import { prisma } from "../../lib/prisma";
import { CreateItemCheckoutBody } from "../../schemas/ItemCheckout";
import { addressService } from "../address";
import { cartService } from "../cart";
import { inventoryService } from "../inventory";
import { inventoryReasonService } from "../inventoryReason";
import { inventoryTransactionService } from "../inventoryTransaction";
import { orderService } from "../order";
import { orderItemService } from "../orderItem";
import { orderStatusLogService } from "../orderstatusLog";
import { pricingService } from "../pricing";
import { TransactionType } from "../../generated/prisma/enums";
import { paymentService } from "../payment";

export const checkout = async (userId: string, items: CreateItemCheckoutBody) => {
    const order = await prisma.$transaction(async (tx) => {

        const cart = await cartService.getCheckoutCart(
            tx,
            userId,
            items
        );

        const address = await addressService.getCheckoutAddress(tx, userId, items.addressId);

        const price = await pricingService.calculateOrderAmount(cart.cartItems, items.shippingMethod);

        const reserve = await inventoryService.reserve(
            tx,
            cart.cartItems
        );


        const order = await orderService.create(
            tx,
            userId,
            address,
            items.shippingMethod,
            price
        );


        await orderItemService.createMany(
            tx,
            order.id,
            cart.cartItems
        );

        await orderStatusLogService.create(
            tx,
            userId,
            order.id,
            order.status
        );

        const reason = await inventoryReasonService.findByCode(
            tx,
            "RESERVE",
            TransactionType.OUT,
        );

        await inventoryTransactionService.createReserveTransactions(
            tx,
            userId,
            reserve,
            reason
        );

        await cartService.deleteCheckoutItems(
            tx,
            cart.cartId,
            items
        );

        const payment = await paymentService.create(
            tx,
            order.id,
            order.totalAmount
        )

        return {
            order,
            payment
        };
    });


    // await reservationService.create(
    //     order.id
    // );

    return {
        order: order.order,
        payment: order.payment
        // paymentId: order.payment.id,
        // expiresAt: order.order.expiresAt
    };
};
