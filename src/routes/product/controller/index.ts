import { Request, Response, NextFunction } from "express";
import { authService } from "../../../service/auth";
import { loginBodySchema } from "../../../schemas/auth";
import { productService } from "../../../service/product";

const productController = {
    async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await productService.findAll();

            res.status(200).json(result);
            return;
        } catch (error) {
            next(error);
        }
    }
}


export default productController;