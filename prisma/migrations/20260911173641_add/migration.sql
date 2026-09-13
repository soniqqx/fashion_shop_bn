/*
  Warnings:

  - You are about to drop the column `distrinct` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `recepientName` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `inventory_transaction` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_distrinct` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_namae` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `order_item` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cart_id,variant_id]` on the table `cart_item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[variant_id]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `district` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientName` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `cart_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_en` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_th` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_district` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_name` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `order_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_product_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_status_log" DROP CONSTRAINT "order_status_log_changed_by_fkey";

-- DropIndex
DROP INDEX "cart_item_cart_id_product_id_key";

-- DropIndex
DROP INDEX "inventory_product_id_key";

-- DropIndex
DROP INDEX "product_sku_key";

-- AlterTable
ALTER TABLE "address" DROP COLUMN "distrinct",
DROP COLUMN "recepientName",
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "recipientName" TEXT NOT NULL,
ALTER COLUMN "is_default" SET DEFAULT false;

-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "category" DROP COLUMN "name",
ADD COLUMN     "name_en" TEXT NOT NULL,
ADD COLUMN     "name_th" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventory_transaction" DROP COLUMN "created_by";

-- AlterTable
ALTER TABLE "order" DROP COLUMN "shipping_distrinct",
DROP COLUMN "shipping_namae",
ADD COLUMN     "shipping_district" TEXT NOT NULL,
ADD COLUMN     "shipping_name" TEXT NOT NULL,
ALTER COLUMN "courier_name" DROP NOT NULL,
ALTER COLUMN "tracking_number" DROP NOT NULL,
ALTER COLUMN "shipped_at" DROP NOT NULL,
ALTER COLUMN "cancelled_reason" DROP NOT NULL,
ALTER COLUMN "expires_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_status_log" ALTER COLUMN "from_status" DROP NOT NULL,
ALTER COLUMN "changed_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payment" ALTER COLUMN "transaction_ref" DROP NOT NULL,
ALTER COLUMN "paid_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "image_url",
DROP COLUMN "price",
DROP COLUMN "sku",
DROP COLUMN "unit";

-- CreateTable
CREATE TABLE "product_variant" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "image_url" TEXT,
    "color" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'ตัว',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_product_id_color_size_key" ON "product_variant"("product_id", "color", "size");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cart_id_variant_id_key" ON "cart_item"("cart_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_variant_id_key" ON "inventory"("variant_id");

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_log" ADD CONSTRAINT "order_status_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
