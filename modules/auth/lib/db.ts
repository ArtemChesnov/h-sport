/**
 * Утилиты для работы с БД в модуле авторизации
 */

import { prisma } from "@/prisma/prisma-client";
import { hashPassword, verifyPassword } from "./password";
import { generateToken, getTokenExpiry, hashToken } from "./tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

/**
 * Создаёт нового пользователя
 */
export async function createUser(
  email: string,
  password: string,
  name?: string,
): Promise<{ id: string; email: string }> {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
    },
  });

  // Создаём токен для подтверждения email
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expires = getTokenExpiry();

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: tokenHash,
      expires,
    },
  });

  // Отправляем email для подтверждения (отправляем raw token)
  try {
    await sendVerificationEmail(email, rawToken);
  } catch (error) {
    // Логируем ошибку, но не прерываем регистрацию
    // Логируем ошибку, но не прерываем регистрацию
    const {logger} = await import("@/shared/lib/logger");
    logger.error("Ошибка при отправке email подтверждения", error);
  }

  return user;
}

/**
 * Проверяет учётные данные пользователя
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{ id: string; email: string; emailVerified: Date | null } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      emailVerified: true,
    },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}

/**
 * Подтверждает email пользователя
 */
export async function verifyUserEmail(token: string): Promise<boolean> {
  // Хешируем токен для поиска в БД
  const tokenHash = hashToken(token);
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!verificationToken) {
    return false;
  }

  const now = new Date();
  if (verificationToken.expires < now) {
    // Удаляем истёкший токен
    await prisma.verificationToken.delete({
      where: { token: tokenHash },
    });
    return false;
  }

  // Обновляем пользователя
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: now },
  });

  // Удаляем использованный токен
  await prisma.verificationToken.delete({
    where: { token: tokenHash },
  });

  return true;
}

/**
 * Создаёт токен для восстановления пароля
 */
export async function createPasswordResetToken(
  email: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    // Не раскрываем, существует ли пользователь
    return null;
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expires = getTokenExpiry();

  // Удаляем старые токены для этого пользователя
  await prisma.passwordResetToken.deleteMany({
    where: { identifier: email },
  });

  // Создаём новый токен (сохраняем хеш)
  await prisma.passwordResetToken.create({
    data: {
      identifier: email,
      token: tokenHash,
      expires,
      userId: user.id,
    },
  });

  // Отправляем email (отправляем raw token)
  try {
    await sendPasswordResetEmail(email, rawToken);
  } catch (error) {
    const {logger} = await import("@/shared/lib/logger");
    logger.error("Ошибка при отправке email восстановления пароля", error);
    return null;
  }

  return rawToken;
}

/**
 * Сбрасывает пароль пользователя
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<boolean> {
  // Хешируем токен для поиска в БД
  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!resetToken) {
    return false;
  }

  const now = new Date();
  if (resetToken.expires < now) {
    // Удаляем истёкший токен
    await prisma.passwordResetToken.delete({
      where: { token: tokenHash },
    });
    return false;
  }

  // Хешируем новый пароль
  const passwordHash = await hashPassword(newPassword);

  // Обновляем пароль пользователя
  await prisma.user.update({
    where: { email: resetToken.identifier },
    data: { passwordHash },
  });

  // Удаляем использованный токен
  await prisma.passwordResetToken.delete({
    where: { token: tokenHash },
  });

  return true;
}
