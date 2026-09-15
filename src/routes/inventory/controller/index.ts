import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../lib/errors";
import { inventoryService } from "../../../service/inventory";

const inventoryController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await inventoryService.findAll();
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

            const result = await inventoryService.findById(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    }
}

export default inventoryController;