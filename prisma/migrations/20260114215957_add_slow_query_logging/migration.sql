-- CreateTable
CREATE TABLE "SlowQuery" (
    "id" SERIAL NOT NULL,
    "query" VARCHAR(500) NOT NULL,
    "duration" INTEGER NOT NULL,
    "endpoint" VARCHAR(255),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlowQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SlowQuery_duration_idx" ON "SlowQuery"("duration");

-- CreateIndex
CREATE INDEX "SlowQuery_createdAt_idx" ON "SlowQuery"("createdAt");

-- CreateIndex
CREATE INDEX "SlowQuery_endpoint_idx" ON "SlowQuery"("endpoint");
