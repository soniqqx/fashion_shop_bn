import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import inventoryTransactionController from './controller';
import { createInventoryTransactionBody } from '../../schemas/inventoryTransaction';

const router = express.Router();

router.get("/find-all", inventoryTransactionController.findAll)
router.get("/find-by-id/:id", authMiddleware, checkRole([Role.ADMIN]), inventoryTransactionController.findById)
router.post("/create", authMiddleware, checkRole([Role.ADMIN]), validate(createInventoryTransactionBody), inventoryTransactionController.create)


export default router;