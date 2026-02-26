/** Админка: подписчики и выпуски рассылки (CRUD, отправка). */

import { prisma } from "@/prisma/prisma-client";
import { randomBytes } from "crypto";

export type AdminSubscriberDto = {
  id: number;
  email: string;
  source: string | null;
  isConfirmed: boolean;
  createdAt: string;
  confirmedAt: string | null;
};

export type AdminNewsletterIssueDto = {
  id: number;
  subject: string;
  bodyHtml: string;
  sentAt: string | null;
  createdAt: string;
};

export async function getSubscribersList(params: {
    email?: string;
    isConfirmed?: boolean;
    page: number;
    perPage: number;
    skip: number;
  },
): Promise<{ items: AdminSubscriberDto[]; total: number }> {
  const where: { email?: { contains: string; mode: "insensitive" }; isConfirmed?: boolean } = {};
  if (params.email?.trim()) {
    where.email = { contains: params.email.trim(), mode: "insensitive" };
  }
  if (typeof params.isConfirmed === "boolean") {
    where.isConfirmed = params.isConfirmed;
  }

  const [total, rows] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.perPage,
    }),
  ]);

  const items: AdminSubscriberDto[] = rows.map((r) => ({
    id: r.id,
    email: r.email,
    source: r.source,
    isConfirmed: r.isConfirmed,
    createdAt: r.createdAt.toISOString(),
    confirmedAt: r.confirmedAt?.toISOString() ?? null,
  }));

  return { items, total };
}

/** Удалить подписчика (отписать из админки). */
export async function deleteSubscription(subscriptionId: number): Promise<boolean> {
  const result = await prisma.subscription.deleteMany({
    where: { id: subscriptionId },
  });
  return result.count > 0;
}

export async function getNewsletterIssuesList(params: {
  page: number;
  perPage: number;
  skip: number;
}): Promise<{ items: AdminNewsletterIssueDto[]; total: number }> {
  const [total, rows] = await Promise.all([
    prisma.newsletterIssue.count(),
    prisma.newsletterIssue.findMany({
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.perPage,
    }),
  ]);

  const items: AdminNewsletterIssueDto[] = rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    bodyHtml: r.bodyHtml,
    sentAt: r.sentAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return { items, total };
}

export async function createNewsletterIssue(params: {
  subject: string;
  bodyHtml: string;
}): Promise<AdminNewsletterIssueDto> {
  const row = await prisma.newsletterIssue.create({
    data: {
      subject: params.subject.trim(),
      bodyHtml: params.bodyHtml,
    },
  });
  return {
    id: row.id,
    subject: row.subject,
    bodyHtml: row.bodyHtml,
    sentAt: row.sentAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getNewsletterIssueById(id: number): Promise<AdminNewsletterIssueDto | null> {
  const row = await prisma.newsletterIssue.findUnique({ where: { id } });
  if (!row) return null;
  return {
    id: row.id,
    subject: row.subject,
    bodyHtml: row.bodyHtml,
    sentAt: row.sentAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export type SubscriberForSend = { id: number; email: string };

/** Возвращает выпуск и список подписчиков (id, email) для отправки. */
export async function getIssueAndConfirmedEmails(
  issueId: number,
): Promise<{ issue: AdminNewsletterIssueDto; subscribers: SubscriberForSend[] } | null> {
  const issue = await prisma.newsletterIssue.findUnique({ where: { id: issueId } });
  if (!issue || issue.sentAt) return null;

  const subs = await prisma.subscription.findMany({
    where: { isConfirmed: true },
    select: { id: true, email: true },
  });
  const subscribers = subs.map((s) => ({ id: s.id, email: s.email }));

  return {
    issue: {
      id: issue.id,
      subject: issue.subject,
      bodyHtml: issue.bodyHtml,
      sentAt: null, // sentAt гарантированно null после guard выше
      createdAt: issue.createdAt.toISOString(),
    },
    subscribers,
  };
}

export async function markIssueSent(issueId: number): Promise<void> {
  await prisma.newsletterIssue.update({
    where: { id: issueId },
    data: { sentAt: new Date() },
  });
}

/** Генерирует и сохраняет токен отписки для подписчика. Возвращает токен. */
export async function setUnsubscribeToken(subscriptionId: number): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { token },
  });
  return token;
}
