import { z } from 'zod';

export const createProductBody = z.object({
    name: z.string().min(2, { message: "Product must be at least 2 characters" }).regex(/^[a-zA-Zก-๙0-9\s\-_(.+)]+$/),
    description: z.string().optional().nullable(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Price must be number only" }),
    unit: z.string().regex(/^[a-zA-Zก-๙\s]+$/),
    imageUrl: z.url({ message: "Format url not correct" }),
    categoryId: z.string().min(1, { message: "Please input category" }),
});

export type CreateProductBody = z.infer<typeof createProductBody>;

export const productSchema = createProductBody.extend({
    sku: z.string(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const updateProductBody = createProductBody.extend({}).partial().strict();

export type UpdateProductBody = z.infer<typeof updateProductBody>;
