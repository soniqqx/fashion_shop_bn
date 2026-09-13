import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../lib/errors";
import { categoryService } from "../../../service/category";
import { createCategoryBody, updateCategoryBody } from "../../../schemas/category";

const categoryController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await categoryService.findAll();
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

            const result = await categoryService.findById(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = createCategoryBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const result = await categoryService.create(parseResult.data);
            res.status(201).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = updateCategoryBody.safeParse(req.body);
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

            const result = await categoryService.update(id, parseResult.data);
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

            const result = await categoryService.delete(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
}

export default categoryController;