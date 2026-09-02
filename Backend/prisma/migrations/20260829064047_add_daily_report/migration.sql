-- DropIndex
DROP INDEX "Transaction_checkInAt_idx";

-- DropIndex
DROP INDEX "Transaction_plateNumber_idx";

-- DropIndex
DROP INDEX "Transaction_status_idx";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "reportId" INTEGER,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" SERIAL NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "completedTransactions" INTEGER NOT NULL DEFAULT 0,
    "activeTransactions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_reportDate_key" ON "DailyReport"("reportDate");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
