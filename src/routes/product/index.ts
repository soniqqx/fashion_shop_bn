import express from 'express';
import productController from './controller';

const router = express.Router();

router.get("/find-all", productController.findAll)

export default router;