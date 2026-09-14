import express from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { checkRole } from '../../middlewares/role';
import { Role } from '../../generated/prisma/enums';
import categoryController from './controller';
import { createCategoryBody, updateCategoryBody } from '../../schemas/category';

const router = express.Router();

router.get("/find-all", categoryController.findAll)
router.get("/find-by-id/:id", categoryController.findById)
router.post("/create", authMiddleware, checkRole([Role.ADMIN]), validate(createCategoryBody), categoryController.create)
router.put("/update/:id", authMiddleware, checkRole([Role.ADMIN]), validate(updateCategoryBody), categoryController.update)
router.patch("/delete/:id", authMiddleware, checkRole([Role.ADMIN]), categoryController.delete)


export default router;