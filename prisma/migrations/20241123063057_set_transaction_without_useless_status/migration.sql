/*
  Warnings:

  - The values [INIT] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('BUY', 'SELL', 'DONE');
ALTER TABLE "transactions" ALTER COLUMN "partiallyDone" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "partiallyDone" TYPE "TransactionStatus_new" USING ("partiallyDone"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "partiallyDone" DROP DEFAULT;
