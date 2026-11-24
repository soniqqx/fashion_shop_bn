import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { checkRole } from '../../middlewares/role';
import { validate } from '../../middlewares/validate';
import { Role } from '../../generated/prisma/enums';
import { updateOrderBody } from '../../schemas/order';
import orderController from './controller';


const router = express.Router();

router.get("/find-all", authMiddleware, checkRole([Role.USER]), orderController.findAll);
router.get("/find-by-id/:id", authMiddleware, checkRole([Role.USER]), orderController.findById);
router.put("/update/:id", authMiddleware, checkRole([Role.ADMIN]), validate(updateOrderBody), orderController.update);
router.patch("/update/:id", authMiddleware, checkRole([Role.ADMIN]), validate(updateOrderBody), orderController.update);


export default router;
