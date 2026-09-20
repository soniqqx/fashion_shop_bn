import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../lib/errors";
import { CreateItemCheckoutBody } from "../../schemas/ItemCheckout";

export const cartService = {
    async getCheckoutCart(tx: Prisma.TransactionClient, userId: string, items: CreateItemCheckoutBody) {
        const uniqueCartItemIds = Array.from(new Set(items.cartItemId));

        if (uniqueCartItemIds.length === 0) {
            throw new AppError(400, "No items selected for checkout");
        }
        //validate cartItems ว่ามีอยู่จริงมั้ย
        const cartItems = await tx.cartItem.findMany({
            where: {
                id: {
                    in: uniqueCartItemIds,
                },
                cart: {
                    userId,
                },
            },
            include: {
                variant: {
                    include: {
                        product: true,
                        inventory: true,
                    },
                },
            },
        });

        if (cartItems.length !== uniqueCartItemIds.length) {
            throw new AppError(
                404,
                "One or more cart items were not found"
            );
        }

        for (const item of cartItems) {

            const variant = item.variant;
            const product = variant?.product;
            const inventory = variant?.inventory;

            // เช็คว่ามี Variant และ Product อยู่จริง
            if (!variant || !product) {
                throw new AppError(400, "Product or variant information is missing");
            }

            // เช็คสถานะ Active
            if (!product.isActive) {
                throw new AppError(
                    400,
                    `Product "${product.name}" is no longer available`
                );
            }

            if (!variant.isActive) {
                throw new AppError(
                    400,
                    `Variant "${variant.id}" is no longer available`
                );
            }

            // เช็คคลังสินค้า (Inventory & Stock Level)
            if (!inventory) {
                throw new AppError(500, `Inventory data missing for "${product.name}"`);
            }
        }

        return {
            cartId: cartItems[0].cartId,
            cartItems
        };
    },

    async deleteCheckoutItems(tx: Prisma.TransactionClient, cartId: string, cartItem: CreateItemCheckoutBody) {
        const uniqueCartItemIds = Array.from(new Set(cartItem.cartItemId));

        if (uniqueCartItemIds.length === 0) {
            throw new AppError(400, "No items selected for checkout");
        }
        const result = await tx.cartItem.deleteMany({
            where: {
                id: {
                    in: uniqueCartItemIds,
                },
                cart: {
                    id: cartId,
                },
            },
        });

        if (result.count !== uniqueCartItemIds.length) {
            throw new AppError(409, "Cart items changed before checkout completed");
        }
    }
}
export type GetCheckoutCartResult = Awaited<ReturnType<typeof cartService.getCheckoutCart>>;
export type CheckoutCartItem = GetCheckoutCartResult["cartItems"][number];
