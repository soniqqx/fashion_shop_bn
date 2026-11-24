import { z } from "zod";
import { OrderStatus } from "../generated/prisma/enums";

export const updateOrderBody = z
    .object({
        status: z
            .enum(OrderStatus, {
                message: "Invalid order status",
            })
            .optional(),
        courierName: z
            .string()
            .trim()
            .min(1, { message: "Courier name must not be empty" })
            .max(100, { message: "Courier name must not exceed 100 characters" })
            .optional(),
        trackingNumber: z
            .string()
            .trim()
            .min(1, { message: "Tracking number must not be empty" })
            .max(100, { message: "Tracking number must not exceed 100 characters" })
            .optional(),
        cancelledReason: z
            .string()
            .trim()
            .min(1, { message: "Cancelled reason must not be empty" })
            .max(500, { message: "Cancelled reason must not exceed 500 characters" })
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    })
    .superRefine((data, ctx) => {
        if (data.status === OrderStatus.SHIPPED) {
            if (!data.courierName) { //must be sent courierName
                ctx.addIssue({
                    code: "custom",
                    path: ["courierName"],
                    message: "Courier name is required when status is SHIPPED",
                });
            }
            if (!data.trackingNumber) { //must be sent tracking number
                ctx.addIssue({
                    code: "custom",
                    path: ["trackingNumber"],
                    message: "Tracking number is required when status is SHIPPED",
                });
            }
        }

        if (data.status === OrderStatus.CANCELLED && !data.cancelledReason) { //must be sent cancelledReason
            ctx.addIssue({
                code: "custom",
                path: ["cancelledReason"],
                message: "Cancelled reason is required when status is CANCELLED",
            });
        }
    });

export type UpdateOrderBody = z.infer<typeof updateOrderBody>;
