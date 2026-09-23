import express from 'express';
import user from './user';
import auth from './auth';
import product from './product'
import variant from './productVariant'
import category from './category'
import address from './address'
import inventoryReason from './inventoryReason'
import inventory from './inventory'
import inventoryTransaction from './inventoryTransaction'
import cartItem from './cartItem'
import checkout from './checkout'
import payment from './payment'






const router = express.Router();
router.use("/api/auth", auth)
router.use("/api/user", user)
router.use("/api/product", product)
router.use("/api/variant", variant)
router.use("/api/category", category)
router.use("/api/address", address)
router.use("/api/inventory-reason", inventoryReason)
router.use("/api/inventory", inventory)
router.use("/api/inventory-transaction", inventoryTransaction)
router.use("/api/cart-item", cartItem)
router.use("/api/", checkout)
router.use("/api/payment", payment)







export default router;