/*
  Warnings:

  - You are about to drop the column `matched_transaction_id` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matched_id]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_matched_transaction_id_fkey";

-- DropIndex
DROP INDEX "transactions_matched_transaction_id_key";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "matched_transaction_id",
ADD COLUMN     "matched_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_matched_id_key" ON "transactions"("matched_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_matched_id_fkey" FOREIGN KEY ("matched_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
