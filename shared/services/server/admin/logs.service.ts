import { prisma } from "@/prisma/prisma-client";
import type { SecurityEventType } from "@prisma/client";

export async function getClientErrorLogs(skip: number, take: number) {
  const [items, total] = await Promise.all([
    prisma.clientErrorLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.clientErrorLog.count(),
  ]);

  return {
    items: items.map((e) => ({
      id: e.id,
      message: e.message,
      stack: e.stack,
      componentStack: e.componentStack,
      userAgent: e.userAgent,
      url: e.url,
      createdAt: e.createdAt.toISOString(),
    })),
    total,
  };
}

export async function getSecurityLogs(skip: number, take: number, type?: SecurityEventType) {
  const where = type ? { type } : {};

  const [items, total] = await Promise.all([
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.securityEvent.count({ where }),
  ]);

  return {
    items: items.map((e) => ({
      id: e.id,
      type: e.type,
      ip: e.ip,
      userAgent: e.userAgent,
      details: e.details,
      createdAt: e.createdAt.toISOString(),
    })),
    total,
  };
}

export async function getWebhookLogs(skip: number, take: number, source?: string) {
  const where = source ? { source } : {};

  const [items, total] = await Promise.all([
    prisma.webhookLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.webhookLog.count({ where }),
  ]);

  return {
    items: items.map((e) => ({
      id: e.id,
      source: e.source,
      ip: e.ip,
      invId: e.invId,
      result: e.result,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
    })),
    total,
  };
}
