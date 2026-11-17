import { Request, Response, NextFunction } from "express";
import { orderService } from "../../../service/order";
import { AppError } from "../../../lib/errors";

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
    }
};

export default orderController;