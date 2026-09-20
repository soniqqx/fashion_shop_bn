import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import checkoutController from './controller';
import { createItemCheckoutBody } from '../../schemas/ItemCheckout';
import { validate } from '../../middlewares/validate';

const router = express.Router();

router.post("/checkout", authMiddleware, checkRole([Role.USER]), validate(createItemCheckoutBody), checkoutController.checkout)

export default router;