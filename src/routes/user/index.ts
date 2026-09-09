import express from 'express';
import userController from './controller';


const router = express.Router();

router.get("/find-by-email", userController.findByEmail)

export default router;