-- AlterTable
ALTER TABLE "GeneratedContent" ADD COLUMN     "diaflowSessionId" TEXT,
ADD COLUMN     "processingStatus" TEXT NOT NULL DEFAULT 'completed',
ADD COLUMN     "sourceId" TEXT;

-- CreateIndex
CREATE INDEX "GeneratedContent_sourceId_idx" ON "GeneratedContent"("sourceId");

-- CreateIndex
CREATE INDEX "GeneratedContent_diaflowSessionId_idx" ON "GeneratedContent"("diaflowSessionId");

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
