import { Request, Response, NextFunction } from "express";
import { orderService } from "../../../service/order";
import { AppError } from "../../../lib/errors";
import { updateOrderBody } from "../../../schemas/order";

const orderController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = res.locals.auth.sub
            const result = await orderService.findAll(userId);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = res.locals.auth.sub
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new AppError(400, "id must be a string.");
            }

            const result = await orderService.findById(id, userId);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = updateOrderBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new AppError(400, "id must be a string.");
            }

            const adminId = res.locals.auth.sub;
            const result = await orderService.update(id, adminId, parseResult.data);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
};

export default orderController;
