import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import orderController from './controller';


const router = express.Router();

router.get("/find-all", authMiddleware, checkRole([Role.USER]), orderController.findAll);
router.get("/find-by-id/:id", authMiddleware, checkRole([Role.USER]), orderController.findById);



export default router;