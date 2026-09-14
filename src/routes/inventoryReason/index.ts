import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import inventoryReasonController from './controller';
import { createInventoryReasonBody, updateInventoryReasonBody } from '../../schemas/inventoryReason';

const router = express.Router();

router.get("/find-all", authMiddleware, checkRole([Role.ADMIN]), inventoryReasonController.findAll)
router.get("/find-by-id/:id", authMiddleware, checkRole([Role.ADMIN]), inventoryReasonController.findById)
router.post("/create", authMiddleware, checkRole([Role.ADMIN]), validate(createInventoryReasonBody), inventoryReasonController.create)
router.put("/update/:id", authMiddleware, checkRole([Role.ADMIN]), validate(updateInventoryReasonBody), inventoryReasonController.update)
router.patch("/delete/:id", authMiddleware, checkRole([Role.ADMIN]), inventoryReasonController.delete)


export default router;