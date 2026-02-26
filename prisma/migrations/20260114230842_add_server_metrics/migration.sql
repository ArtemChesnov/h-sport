-- CreateTable
CREATE TABLE "ServerMetrics" (
    "id" SERIAL NOT NULL,
    "heapUsed" BIGINT NOT NULL,
    "heapTotal" BIGINT NOT NULL,
    "rss" BIGINT NOT NULL,
    "external" BIGINT NOT NULL,
    "cpuUser" BIGINT NOT NULL,
    "cpuSystem" BIGINT NOT NULL,
    "cpuCount" INTEGER NOT NULL,
    "freemem" BIGINT NOT NULL,
    "totalmem" BIGINT NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServerMetrics_createdAt_idx" ON "ServerMetrics"("createdAt");
