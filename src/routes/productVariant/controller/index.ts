import { Request, Response, NextFunction } from "express";
import { productService } from "../../../service/product";
import { AppError } from "../../../lib/errors";
import { createProductVariantsBody } from "../../../schemas/productVariant";
import { productVariantService } from "../../../service/productVariant";

const productController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await productVariantService.findAll();
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async findByProductId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const productId = req.params.id;
            if (!productId || typeof productId !== "string") {
                throw new AppError(400, "id must be a string.");
            }

            const result = await productVariantService.findByProductId(productId);
            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
    async createManyVariants(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parseResult = createProductVariantsBody.safeParse(req.body);
            if (!parseResult.success) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: parseResult.error.format(),
                });
                return;
            }
            const productId = req.params.id;
            if (!productId || typeof productId !== "string") {
                throw new AppError(400, "id must be a string.");
            }

            const result = await productVariantService.createMany(productId, parseResult.data);
            res.status(201).json(result);
            return;
        } catch (error) {
            next(error);
        }
    },
}


export default productController;