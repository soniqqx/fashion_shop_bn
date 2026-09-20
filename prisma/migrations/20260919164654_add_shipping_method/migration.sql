/*
  Warnings:

  - Added the required column `shipping_method` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_total_amount` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('STANDARD', 'EXPRESS');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "shipping_method" "ShippingMethod" NOT NULL,
ADD COLUMN     "sub_total_amount" DECIMAL(10,2) NOT NULL;
