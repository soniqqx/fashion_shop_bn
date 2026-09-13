import express from 'express';
import productController from './controller';
import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import { createProductVariantsBody } from '../../schemas/productVariant';

const router = express.Router();

router.get("/find-all", productController.findAll)
router.get("/find-by-product/:id", authMiddleware, checkRole([Role.ADMIN]), productController.findByProductId)
router.post("/create-many/:id", authMiddleware, checkRole([Role.ADMIN]), validate(createProductVariantsBody), productController.createManyVariants)


export default router;