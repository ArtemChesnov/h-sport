/**
 * Server-side auth facade: signin/signup session data.
 * Uses modules/auth for verifyCredentials and createUser; Prisma only for session/user reads/updates.
 */

import { createUser, verifyCredentials } from "@/modules/auth/lib/db";
import { isPrivilegedEmail } from "@/shared/lib/auth/privileged";
import { prisma } from "@/prisma/prisma-client";

export type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: Date | null;
  sessionVersion: number;
};

/**
 * Verifies credentials and returns session user data for sign-in.
 * Returns null if credentials are invalid or user not found.
 * Если email совпадает с ADMIN_EMAIL — в сессию подставляется роль ADMIN.
 */
export async function getSessionUserAfterSignIn(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await verifyCredentials(email, password);
  if (!user) return null;

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      sessionVersion: true,
    },
  });

  if (!fullUser) return null;

  const role = fullUser.role === "ADMIN" || isPrivilegedEmail(fullUser.email) ? "ADMIN" : "USER";

  return {
    id: fullUser.id,
    email: fullUser.email,
    role,
    emailVerified: fullUser.emailVerified,
    sessionVersion: fullUser.sessionVersion,
  };
}

export type SignUpInput = {
  email: string;
  password: string;
  name?: string;
  secondName?: string;
};

export type SignUpResult = { sessionUser: SessionUser } | { error: string };

/**
 * Registers a new user and returns session user data.
 * Returns { error } if user already exists or validation fails.
 */
export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    return { error: "Пользователь с таким email уже существует" };
  }

  const user = await createUser(input.email, input.password, input.name);

  if (input.secondName) {
    await prisma.user.update({
      where: { id: user.id },
      data: { secondName: input.secondName },
    });
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { sessionVersion: true },
  });

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: isPrivilegedEmail(user.email) ? "ADMIN" : "USER",
    emailVerified: null,
    sessionVersion: fullUser?.sessionVersion ?? 0,
  };

  return { sessionUser };
}
