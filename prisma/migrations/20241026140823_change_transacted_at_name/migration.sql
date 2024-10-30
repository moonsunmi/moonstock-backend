/*
  Warnings:

  - You are about to drop the column `transactAt` on the `holdings` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_at` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matched_transaction_id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "holdings" DROP COLUMN "transactAt",
ADD COLUMN     "transactedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "transaction_at",
ADD COLUMN     "matched_transaction_id" TEXT,
ADD COLUMN     "transacted_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_matched_transaction_id_key" ON "transactions"("matched_transaction_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_matched_transaction_id_fkey" FOREIGN KEY ("matched_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
