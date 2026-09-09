import { Request, Response, NextFunction } from "express";
import { authService } from "../../../service/auth";
import { loginBodySchema } from "../../../schemas/auth";
import { userService } from "../../../service/user";

const authController = {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = loginBodySchema.safeParse(req.body);

            if (!parseResult.success) {
                // ถ้าข้อมูลไม่ตรงตาม Schema ให้ตอบ 400 พร้อมบอกจุดที่ผิด
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            // parseResult.data จะถูก Cast เป็น Type LoginBody อัตโนมัติ
            const result = await authService.login(parseResult.data);

            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async findUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = res.locals.auth.sub
            const result = await userService.findById(id)

            if (!result) {
                res.status(404).json({
                    message: "User not found"
                })
            }
            res.status(200).json(result)
            return;
        } catch (error) {
            next(error)
        }

    }
}


export default authController;