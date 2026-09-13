import { z } from 'zod';

export const createCategoryBody = z.object({
    nameTh: z.string().min(2, { message: "Category must be at least 2 characters" }).regex(/^[ก-๙0-9\s\-_/(.+)]+$/),
    nameEn: z.string().min(2, { message: "Category must be at least 2 characters" }).regex(/^[a-zA-Z0-9\s\-_/(.+)]+$/),
    slug: z.string().optional().nullable(),
});

export const updateCategoryBody = createCategoryBody
    .pick({
        nameTh: true,
        nameEn: true
    })
    .partial()
    .extend({ isActive: z.boolean().optional() })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });
export type CreateCategoryBody = z.infer<typeof createCategoryBody>;
export type UpdateCategoryBody = z.infer<typeof updateCategoryBody>;
