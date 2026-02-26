/**
 * Утилита для выполнения HTTP-запросов с таймаутом
 *
 * Используется для внешних HTTP-интеграций (CDEK, Почта России, DaData и т.п.)
 * для предотвращения зависания запросов при проблемах с сетью или внешними сервисами.
 *
 * @param url - URL для запроса
 * @param options - Опции для fetch (метод, заголовки, тело и т.д.)
 * @param timeoutMs - Таймаут в миллисекундах (по умолчанию 10 секунд)
 * @returns Promise с Response от fetch
 * @throws Error с сообщением о таймауте, если запрос превысил лимит времени
 */

export async function fetchWithTimeout(
  url: string | URL,
  options?: RequestInit,
  timeoutMs: number = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Если запрос был отменён из-за таймаута, выбрасываем понятную ошибку
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: запрос к ${url} превысил лимит времени (${timeoutMs}ms)`);
    }

    // Пробрасываем другие ошибки как есть
    throw error;
  }
}
