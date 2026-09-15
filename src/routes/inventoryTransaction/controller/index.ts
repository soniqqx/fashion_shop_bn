import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../lib/errors";
import { inventoryTransactionService } from "../../../service/inventoryTransaction";
import { createInventoryTransactionBody } from "../../../schemas/inventoryTransaction";

const inventoryTransactionController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await inventoryTransactionService.findAll();
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new AppError(400, "id must be a string.");
            }

            const result = await inventoryTransactionService.findById(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = createInventoryTransactionBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const result = await inventoryTransactionService.createTransaction(parseResult.data, res.locals.auth.sub);
            res.status(201).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
}

export default inventoryTransactionController;