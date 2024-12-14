/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `matched_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transacted_at` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `holdings` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `updated_at` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "holdings" DROP CONSTRAINT "holdings_stock_ticker_fkey";

-- DropForeignKey
ALTER TABLE "holdings" DROP CONSTRAINT "holdings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_matched_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_stock_ticker_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- DropIndex
DROP INDEX "transactions_matched_id_key";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "deleted_at",
DROP COLUMN "matched_id",
DROP COLUMN "price",
DROP COLUMN "transacted_at",
DROP COLUMN "type",
ADD COLUMN     "buy_created_at" TIMESTAMP(3),
ADD COLUMN     "buy_price" INTEGER,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "profit" INTEGER,
ADD COLUMN     "rateOfProfit" INTEGER,
ADD COLUMN     "rateOfProfitYear" INTEGER,
ADD COLUMN     "sell_created_at" TIMESTAMP(3),
ADD COLUMN     "sell_price" INTEGER,
ALTER COLUMN "updated_at" SET NOT NULL;

-- DropTable
DROP TABLE "holdings";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_stock_ticker_fkey" FOREIGN KEY ("stock_ticker") REFERENCES "stocks"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
