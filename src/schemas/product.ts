import { z } from 'zod';
import { productVariantBody } from './productVariant';

export const createProductBody = z.object({
    name: z.string().min(2, { message: "Product must be at least 2 characters" }).regex(/^[a-zA-Zก-๙0-9\s\-_(.+)]+$/),
    description: z.string().optional().nullable(),
    categoryId: z.string().min(1, { message: "Please input category" }),
    variants: z.array(productVariantBody).min(1, { message: "Product must have at least one variant" }),
});

export type CreateProductBody = z.infer<typeof createProductBody>;

// export const updateProductBody = createProductBody
//     .pick({
//         name: true,
//         description: true,
//         categoryId: true,
//     })
//     .partial()
//     .refine((data) => Object.keys(data).length > 0, {
//         message: "At least one field must be provided",
//     });

// export type UpdateProductBody = z.infer<typeof updateProductBody>;

export const updateProductBody = z.object({
    name: z.string().min(2, { message: "Product must be at least 2 characters" }).regex(/^[a-zA-Zก-๙0-9\s\-_(.+)]+$/).optional(),
    description: z.string().optional().nullable().optional(),
    categoryId: z.uuid().min(1, { message: "Please input category" }).optional(),
    variants: z.array(productVariantBody).min(1, { message: "Product must have at least one variant" }).optional(),
})
    .refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type UpdateProductBody = z.infer<typeof updateProductBody>;
