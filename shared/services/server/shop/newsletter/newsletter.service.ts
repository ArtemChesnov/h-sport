/** Подписка на рассылку: subscribe, confirm/unsubscribe по токену. */

import { prisma } from "@/prisma/prisma-client";
import { isValidEmail } from "@/shared/lib/validation";
import { randomBytes } from "crypto";

export type SubscribeResult =
  | { ok: true; needConfirmation: boolean }
  | { ok: false; message: string };

/**
 * Подписаться на рассылку (double opt-in: создаём запись с токеном, отправка письма — в API).
 */
export async function subscribe(
  params: { email: string; source?: string; userId?: string | null },
): Promise<SubscribeResult> {
  const email = params.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, message: "Укажите email" };
  }
  if (!isValidEmail(email)) {
    return { ok: false, message: "Некорректный формат email" };
  }

  const token = randomBytes(24).toString("hex");
  const existing = await prisma.subscription.findUnique({ where: { email } });

  if (existing) {
    if (existing.isConfirmed) {
      return { ok: true, needConfirmation: false };
    }
    await prisma.subscription.update({
      where: { email },
      data: { token, source: params.source ?? existing.source, userId: params.userId ?? existing.userId },
    });
    return { ok: true, needConfirmation: true };
  }

  await prisma.subscription.create({
    data: {
      email,
      source: params.source ?? "footer",
      isConfirmed: false,
      token,
      userId: params.userId ?? null,
    },
  });
  return { ok: true, needConfirmation: true };
}

/**
 * Возвращает токен подписки для отправки письма подтверждения (или null, если уже подтверждён).
 */
export async function getSubscriptionToken(
  email: string,
): Promise<string | null> {
  const sub = await prisma.subscription.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { token: true, isConfirmed: true },
  });
  if (!sub || sub.isConfirmed) return null;
  return sub.token;
}

/**
 * Подтвердить подписку по токену.
 */
export async function confirmByToken(
  token: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, message: "Не указан токен" };
  }

  const sub = await prisma.subscription.findFirst({
    where: { token: trimmed },
  });

  if (!sub) {
    return { ok: false, message: "Ссылка недействительна или уже использована" };
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { isConfirmed: true, confirmedAt: new Date(), token: null },
  });
  return { ok: true };
}

/**
 * Отписаться по токену (из ссылки в письме).
 */
export async function unsubscribeByToken(
  token: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, message: "Не указан токен" };
  }

  const sub = await prisma.subscription.findFirst({
    where: { token: trimmed },
  });

  if (!sub) {
    return { ok: false, message: "Ссылка недействительна или уже использована" };
  }

  await prisma.subscription.delete({
    where: { id: sub.id },
  });
  return { ok: true };
}
