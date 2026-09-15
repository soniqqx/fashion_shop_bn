/*
  Warnings:

  - Added the required column `afterQuantity` to the `inventory_transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beforeQuantity` to the `inventory_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "inventory_transaction" DROP CONSTRAINT "inventory_transaction_user_id_fkey";

-- AlterTable
ALTER TABLE "inventory_transaction" ADD COLUMN     "afterQuantity" INTEGER NOT NULL,
ADD COLUMN     "beforeQuantity" INTEGER NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "inventory_transaction" ADD CONSTRAINT "inventory_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
