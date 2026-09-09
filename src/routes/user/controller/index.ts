import { Request, Response, NextFunction } from "express";
import { userService } from "../../../service/user";

const userController = {
    async findByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const email = req.query.email;

            // 1. เช็กความถูกต้องของประเภทข้อมูล (Type Guard)
            if (!email || typeof email !== 'string') {
                res.status(400).json({ message: "Email is required and must be a string" });
                return; // return เปล่าเพื่อจบการทำงาน
            }

            // 2. เรียกใช้ Service
            const result = await userService.findAdminByEmail(email);

            // 3. เคสหาไม่เจอ
            if (!result) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            // 4. เคสสำเร็จ
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    }
};

export default userController;