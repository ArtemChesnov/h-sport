-- CreateTable
CREATE TABLE "NewsletterIssue" (
    "id" SERIAL NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsletterIssue_createdAt_idx" ON "NewsletterIssue"("createdAt");

-- CreateIndex
CREATE INDEX "NewsletterIssue_sentAt_idx" ON "NewsletterIssue"("sentAt");
