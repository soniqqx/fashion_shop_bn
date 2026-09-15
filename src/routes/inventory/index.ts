import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import inventoryController from './controller';

const router = express.Router();

router.get("/find-all", inventoryController.findAll)
router.get("/find-by-id/:id", authMiddleware, checkRole([Role.ADMIN]), inventoryController.findById)

export default router;