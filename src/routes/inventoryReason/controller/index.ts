import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../lib/errors";
import { createInventoryReasonBody, updateInventoryReasonBody } from "../../../schemas/inventoryReason";
import { inventoryReasonService } from "../../../service/inventoryReason";

const inventoryReasonController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await inventoryReasonService.findAll();
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

            const result = await inventoryReasonService.findById(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = createInventoryReasonBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const result = await inventoryReasonService.create(parseResult.data);
            res.status(201).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = updateInventoryReasonBody.safeParse(req.body);
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

            const result = await inventoryReasonService.update(id, parseResult.data);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id || typeof id !== "string") {
                throw new AppError(400, "id must be a string.");
            }

            const result = await inventoryReasonService.delete(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
}

export default inventoryReasonController;