import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // 1. เช็กว่าล็อกอินหรือยัง (req.user ต้องถูกแปะมาจาก authMiddleware ก่อนหน้า)
        const auth = res.locals.auth as { sub: string; username: string; role: string } | undefined;
        if (!auth) {
            res.status(401).json({ message: "Unauthorized: Please log in first" });
            return;
        }

        // 2. เช็กว่า role ของผู้ใช้ อยู่ในรายชื่อ allowedRoles หรือไม่
        const hasRole = allowedRoles.includes(auth.role);

        if (!hasRole) {
            res.status(403).json({ message: "Forbidden: You do not have permission" });
            return;
        }

        // 3. ผ่านการตรวจสอบ ให้ทำขั้นตอนถัดไป
        next();
    };
};