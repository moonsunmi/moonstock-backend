/*
  Warnings:

  - You are about to drop the column `unmatchedQty` on the `trades` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trades" DROP COLUMN "unmatchedQty",
ADD COLUMN     "isMatched" BOOLEAN NOT NULL DEFAULT false;
