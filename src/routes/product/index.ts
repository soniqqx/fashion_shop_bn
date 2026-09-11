import express from 'express';
import productController from './controller';
import { authMiddleware } from '../../middlewares/auth';
import { createProductBody, updateProductBody } from '../../schemas/product';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';

const router = express.Router();

router.get("/find-all", productController.findAll)
router.post("/create", authMiddleware, checkRole([Role.ADMIN]), validate(createProductBody), productController.create)
router.put("/update/:id", authMiddleware, checkRole([Role.ADMIN]), validate(updateProductBody), productController.update)
router.patch("/delete/:id", authMiddleware, checkRole([Role.ADMIN]), productController.delete)


export default router;