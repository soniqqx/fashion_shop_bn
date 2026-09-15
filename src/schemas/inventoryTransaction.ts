import { z } from "zod";

export const createInventoryTransactionBody = z.object({
    inventoryId: z.uuid({
        message: "Invalid inventory id",
    }),

    reasonId: z.uuid({
        message: "Invalid reason id",
    }),

    quantity: z
        .number()
        .int({
            message: "Quantity must be an integer",
        })
        .positive({
            message: "Quantity must be greater than 0",
        }),

    note: z
        .string()
        .max(500, {
            message: "Note must not exceed 500 characters",
        })
        .optional(),

    inputUnitName: z
        .string()
        .max(30, {
            message: "input unit name must not exceed 30 characters",
        })
});

export type CreateInventoryTransactionBody = z.infer<
    typeof createInventoryTransactionBody
>;