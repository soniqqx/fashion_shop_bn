import express from 'express';
import authController from './controller';
import { validate } from '../../middlewares/validate';
import { loginBodySchema } from '../../schemas/auth';
import { authMiddleware } from '../../middlewares/auth';

const router = express.Router();

router.post("/login", validate(loginBodySchema), authController.login)
router.get("/me", authMiddleware, authController.findUserProfile)

export default router;