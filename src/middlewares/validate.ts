import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';


export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.body);
        if (!result.success) {
            res.status(400).json({
                message: "Invalid input data",
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }
        req.body = result.data; // เอาข้อมูลที่ผ่านการ cleanup แล้วใส่กลับเข้า req.body
        next();
    };
};

export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.query);
        if (!result.success) {
            res.status(400).json({
                message: "Invalid query parameters",
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }
        res.locals.query = result.data;
        next();
    };
};
