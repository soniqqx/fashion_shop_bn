import { z } from 'zod';

export const productVariantBody = z.object({
    id: z.uuid().optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    imageUrl: z.url().optional().nullable(),
    color: z.string().min(1),
    size: z.string().min(1),
    unit: z.string().min(1),
    isActive: z.boolean().optional()
});

export const createProductVariantsBody = z.object({
    // productId: z.string().min(1, { message: "Please input product" }),
    variants: z.array(productVariantBody).min(1, { message: "At least one variant is required" }),
});

export const updateProductVariantsBody = z.object({
    variants: z.array(productVariantBody).min(1, { message: "At least one variant is required" }),
});

export type ProductVariantBody = z.infer<typeof productVariantBody>;

export type CreateProductVariantsBody = z.infer<typeof createProductVariantsBody>;

export type UpdateProductVariantsBody = z.infer<typeof updateProductVariantsBody>;



