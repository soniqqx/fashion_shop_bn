import express from 'express';
import user from './user';
import auth from './auth';
import product from './product'
import variant from './productVariant'
import category from './category'
import address from './address'

const router = express.Router();
router.use("/api/auth", auth)
router.use("/api/user", user)
router.use("/api/product", product)
router.use("/api/variant", variant)
router.use("/api/category", category)
router.use("/api/address", address)


export default router;