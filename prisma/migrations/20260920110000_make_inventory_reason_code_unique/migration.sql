-- Checkout identifies inventory reasons by code, so duplicate codes are invalid.
CREATE UNIQUE INDEX "inventory_transaction_reason_code_key"
ON "inventory_transaction_reason"("code");
