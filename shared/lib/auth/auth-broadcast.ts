/**
 * BroadcastChannel для синхронизации состояния авторизации между вкладками
 *
 * Когда пользователь выходит из аккаунта в одной вкладке,
 * все остальные вкладки также обновляют своё состояние.
 */

import { useEffect } from "react";

type AuthBroadcastMessage =
  | { type: "LOGOUT" }
  | { type: "LOGIN"; userId: string }
  | { type: "SESSION_REFRESH" };

type AuthBroadcastListener = (message: AuthBroadcastMessage) => void;

const CHANNEL_NAME = "h-sport:auth";

/**
 * Singleton для BroadcastChannel
 */
let channel: BroadcastChannel | null = null;
const listeners = new Set<AuthBroadcastListener>();

/**
 * Инициализирует BroadcastChannel (если доступен)
 */
function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!("BroadcastChannel" in window)) return null;

  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
      listeners.forEach((listener) => {
        try {
          listener(event.data);
        } catch {
          // Игнорируем ошибки в listeners
        }
      });
    };
  }

  return channel;
}

/**
 * Отправляет сообщение о logout во все вкладки
 */
export function broadcastLogout(): void {
  const ch = getChannel();
  if (ch) {
    ch.postMessage({ type: "LOGOUT" } satisfies AuthBroadcastMessage);
  }
}

/**
 * Отправляет сообщение о login во все вкладки
 */
export function broadcastLogin(userId: string): void {
  const ch = getChannel();
  if (ch) {
    ch.postMessage({ type: "LOGIN", userId } satisfies AuthBroadcastMessage);
  }
}

/**
 * Отправляет сообщение об обновлении сессии во все вкладки
 */
export function broadcastSessionRefresh(): void {
  const ch = getChannel();
  if (ch) {
    ch.postMessage({ type: "SESSION_REFRESH" } satisfies AuthBroadcastMessage);
  }
}

/**
 * Подписывается на сообщения из других вкладок
 *
 * @returns Функция для отписки
 */
export function subscribeToAuthBroadcast(
  listener: AuthBroadcastListener
): () => void {
  // Инициализируем channel при первой подписке
  getChannel();

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * React hook для подписки на auth broadcast
 *
 * @example
 * useAuthBroadcast((message) => {
 *   if (message.type === "LOGOUT") {
 *     queryClient.setQueryData(USER_PROFILE_QUERY_KEY, null);
 *   }
 * });
 */
export function useAuthBroadcast(listener: AuthBroadcastListener): void {
  useEffect(() => {
    // Для SSR-безопасности проверяем window
    if (typeof window === "undefined") return;

    return subscribeToAuthBroadcast(listener);
  }, [listener]);
}
