import { z } from "zod";

export const createCartItemBody = z.object({
    variantId: z.uuid({
        message: "Invalid variant id",
    }),

    quantity: z
        .number()
        .int({
            message: "Quantity must be an integer",
        })
        .positive({
            message: "Quantity must be greater than 0",
        }),

});

export const updateCartItemBody = createCartItemBody
    .pick({
        quantity: true
    });

export type CreateCartItemBody = z.infer<
    typeof createCartItemBody
>;

export type UpdateCartItemBody = z.infer<
    typeof updateCartItemBody
>;