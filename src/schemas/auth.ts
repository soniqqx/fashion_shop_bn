import { z } from 'zod';

// 1. สร้าง Schema สำหรับ Validate req.body ตอน Login
export const loginBodySchema = z.object({
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});


// 2. Export Type ออกไปใช้ใน Service (ได้ Type อัตโนมัติ!)
export type LoginBody = z.infer<typeof loginBodySchema>;