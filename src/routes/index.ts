import express from 'express';
import user from './user';
import auth from './auth';
import product from './product'

const router = express.Router();
router.use("/api/auth", auth)
router.use("/api/user", user)
router.use("/api/product", product)


export default router;