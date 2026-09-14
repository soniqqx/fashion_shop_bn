/*
  Warnings:

  - Changed the type of `transaction_type` on the `inventory_transaction_reason` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "inventory_transaction_reason" DROP COLUMN "transaction_type",
ADD COLUMN     "transaction_type" "TransactionType" NOT NULL;
