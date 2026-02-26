-- CreateTable
CREATE TABLE "WebVitalsMetric" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "delta" DOUBLE PRECISION,
    "metricId" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebVitalsMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebVitalsMetric_name_idx" ON "WebVitalsMetric"("name");

-- CreateIndex
CREATE INDEX "WebVitalsMetric_createdAt_idx" ON "WebVitalsMetric"("createdAt");

-- CreateIndex
CREATE INDEX "WebVitalsMetric_url_idx" ON "WebVitalsMetric"("url");
