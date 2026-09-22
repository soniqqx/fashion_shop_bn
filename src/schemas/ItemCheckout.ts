import { z } from "zod";
import { ShippingMethod } from "../generated/prisma/enums";

export const createItemCheckoutBody = z.object({
    cartItemId: z.array(
        z.uuid({
            message: "Invalid cart item id",
        })
    ).min(1, "Select at least one item"),

    addressId: z.uuid({ message: "Invalid address id" }),
    shippingMethod: z.enum(ShippingMethod,
        { message: "Invalid shipping method" },
    ),

});


export type CreateItemCheckoutBody = z.infer<
    typeof createItemCheckoutBody
>;
