/*
  Warnings:

  - You are about to drop the column `afterQuantity` on the `inventory_transaction` table. All the data in the column will be lost.
  - You are about to drop the column `beforeQuantity` on the `inventory_transaction` table. All the data in the column will be lost.
  - Added the required column `after_quantity` to the `inventory_transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `before_quantity` to the `inventory_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inventory_transaction" DROP COLUMN "afterQuantity",
DROP COLUMN "beforeQuantity",
ADD COLUMN     "after_quantity" INTEGER NOT NULL,
ADD COLUMN     "before_quantity" INTEGER NOT NULL;
