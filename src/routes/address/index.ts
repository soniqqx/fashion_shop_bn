import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import addressController from './controller';
import { createAddressBody, updateAddressBody } from '../../schemas/address';

const router = express.Router();

router.get("/find-all", authMiddleware, checkRole([Role.ADMIN, Role.USER]), addressController.findAll)
router.get("/find-by-id/:id", authMiddleware, checkRole([Role.ADMIN, Role.USER]), addressController.findById)
router.post("/create", authMiddleware, checkRole([Role.ADMIN, Role.USER]), validate(createAddressBody), addressController.create)
router.put("/update/:id", authMiddleware, checkRole([Role.ADMIN, Role.USER]), validate(updateAddressBody), addressController.update)
router.patch("/delete/:id", authMiddleware, checkRole([Role.ADMIN, Role.USER]), addressController.delete)


export default router;