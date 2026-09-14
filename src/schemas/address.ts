import { z } from 'zod';

export const createAddressBody = z.object({
    userId: z.uuid().optional(),
    recipientName: z.string().min(2, { message: "Recipient name must be at least 2 characters" }).max(100, { message: "Recipient name must be at most 100 characters" }),
    phone: z.string().trim().min(2, { message: "Phone number must be a valid Thai phone number" }).regex(/^0[0-9]{9}$/),
    addressLine: z.string().min(5, { message: "Address must be at least 5 characters" }).max(255, { message: "Address must be at most 255 characters" }),
    district: z.string().trim().min(2, { message: "District must be at least 2 characters" }).max(100, { message: "District must be at most 100 characters" }),
    province: z.string().trim().min(2, { message: "Province must be at least 2 characters" }).max(100, { message: "Province must be at most 100 characters" }),
    postalCode: z.string().trim().regex(/^[0-9]{5}$/, { message: "Postal code must be 5 digits" }),
});

export const updateAddressBody = createAddressBody
    .partial()
    .extend({
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });
export type CreateAddressBody = z.infer<typeof createAddressBody>;
export type UpdateAddressBody = z.infer<typeof updateAddressBody>;
