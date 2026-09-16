import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import cartItemController from './controller';
import { createCartItemBody, updateCartItemBody } from '../../schemas/cartItem';

const router = express.Router();

router.get("/find-all", authMiddleware, checkRole([Role.USER]), cartItemController.findAll)
router.get("/find-by-id/:itemId", authMiddleware, checkRole([Role.USER]), cartItemController.findById)
router.post("/create", authMiddleware, checkRole([Role.USER]), validate(createCartItemBody), cartItemController.create)
router.put("/update/:itemId", authMiddleware, checkRole([Role.USER]), validate(updateCartItemBody), cartItemController.update)
router.delete("/delete/:itemId", authMiddleware, checkRole([Role.USER]), cartItemController.delete)


export default router;