import { cookies } from "next/headers";
import { CSRF_COOKIE_NAME } from "./csrf";

/**
 * Server Component: рендерит meta-тег с CSRF-токеном.
 * Клиент читает токен из meta вместо document.cookie,
 * что позволяет cookie быть httpOnly.
 */
export async function CsrfMeta() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_COOKIE_NAME)?.value ?? "";

  return <meta name="csrf-token" content={token} />;
}
