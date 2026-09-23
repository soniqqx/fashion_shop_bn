import { z } from "zod";

export const updatePaymentBody = z.object({
    orderId: z.uuid({
        message: "Invalid order id",
    }),
});

export type UpdatePaymentBody = z.infer<
    typeof updatePaymentBody
>;