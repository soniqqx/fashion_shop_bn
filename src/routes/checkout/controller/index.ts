import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../lib/errors";
import { checkout } from "../../../service/checkout";
import { createItemCheckoutBody } from "../../../schemas/ItemCheckout";

const checkoutController = {
    async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = res.locals.auth.sub
            const parseResult = createItemCheckoutBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }
            const result = await checkout(userId, parseResult.data);
            res.status(201).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
}

export default checkoutController;