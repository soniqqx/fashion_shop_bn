import { z } from "zod";

export const createInventoryReasonBody = z.object({
    code: z
        .string()
        .min(2, { message: "Code must be at least 2 characters" })
        .regex(/^[A-Z0-9_]+$/, {
            message: "Code must contain only uppercase letters, numbers, and underscores",
        }),

    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters" })
        .regex(/^[ก-๙a-zA-Z0-9\s\-_().]+$/, {
            message: "Name contains invalid characters",
        }),

    transactionType: z.enum(["IN", "OUT"]),
});

export const updateInventoryReasonBody = createInventoryReasonBody
    .pick({
        code: true,
        name: true,
        transactionType: true,
    })
    .partial()
    .extend({
        isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export type CreateInventoryReasonBody = z.infer<
    typeof createInventoryReasonBody
>;

export type UpdateInventoryReasonBody = z.infer<
    typeof updateInventoryReasonBody
>;