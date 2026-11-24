import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../lib/errors";
import { cartItemService } from "../../../service/cartItem";
import { createCartItemBody, updateCartItemBody } from "../../../schemas/cartItem";

const cartItemController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = res.locals.auth.sub
            const result = await cartItemService.findAll(userId);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemId = req.params.itemId;
            if (!itemId || typeof itemId !== "string") {
                throw new AppError(400, "id must be a string.");
            }

            const userId = res.locals.auth.sub
            const result = await cartItemService.findById(userId, itemId);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = createCartItemBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const userId = res.locals.auth.sub

            const result = await cartItemService.create(userId, parseResult.data);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = updateCartItemBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const itemId = req.params.itemId;
            if (!itemId || typeof itemId !== "string") {
                throw new AppError(400, "Cart Id must be a string.");
            }

            const userId = res.locals.auth.sub
            const result = await cartItemService.update(userId, itemId, parseResult.data);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemId = req.params.itemId;
            if (!itemId || typeof itemId !== "string") {
                throw new AppError(400, "Cart Id must be a string.");
            }

            const userId = res.locals.auth.sub
            const result = await cartItemService.delete(userId, itemId);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
}

export default cartItemController;