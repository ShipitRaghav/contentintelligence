-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled Project',
    "searchQuery" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "summaryData" JSONB,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL DEFAULT 2025,
    "content" TEXT,
    "transcript" TEXT,
    "summary" TEXT,
    "diaflowSessionId" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT,
    "content" TEXT,
    "complianceStatus" TEXT NOT NULL DEFAULT 'Draft',
    "assignee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Source_projectId_idx" ON "Source"("projectId");

-- CreateIndex
CREATE INDEX "Source_diaflowSessionId_idx" ON "Source"("diaflowSessionId");

-- CreateIndex
CREATE INDEX "GeneratedContent_projectId_idx" ON "GeneratedContent"("projectId");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
