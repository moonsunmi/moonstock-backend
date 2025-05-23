ALTER TABLE "trades" ADD COLUMN "tradeAt" TIMESTAMP(3); 

UPDATE "trades" SET "tradeAt" = "tradeDate";

ALTER TABLE "trades" ALTER COLUMN "tradeAt" SET NOT NULL;

ALTER TABLE "trades" DROP COLUMN "tradeDate";