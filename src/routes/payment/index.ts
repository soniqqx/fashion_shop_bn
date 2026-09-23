import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import paymentController from './controller';
import { updatePaymentBody } from '../../schemas/payment';

const router = express.Router();

router.patch("/:paymentId/pay", authMiddleware, checkRole([Role.USER]), validate(updatePaymentBody), paymentController.pay)


export default router;