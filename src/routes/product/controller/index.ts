import { Request, Response, NextFunction } from "express";
import { productService } from "../../../service/product";
import { adminFindAllProductQuery, createProductBody, updateProductBody } from "../../../schemas/product";
import { AppError } from "../../../lib/errors";

const productController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await productService.findAll();
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async findAllAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = adminFindAllProductQuery.safeParse(req.query);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const result = await productService.findAllAdmin(parseResult.data);
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
            const result = await productService.findById(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = createProductBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }

            const result = await productService.create(parseResult.data);
            res.status(201).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = updateProductBody.safeParse(req.body);
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

            const result = await productService.update(id, parseResult.data);
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

            const result = await productService.delete(id);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    }
}


export default productController;
