import { env } from "@/shared/lib/env.client";
import axios from "axios";

/**
 * Имя cookie с CSRF токеном
 */
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * Получает значение cookie по имени (работает в браузере)
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Базовый axios-инстанс.
 *
 * По умолчанию ходим в Next.js Route Handlers внутри проекта:
 *   /api/...
 *
 * Если нужно бить в другой домен/бекенд — задай NEXT_PUBLIC_API_URL.
 * Важно: ожидается полный базовый префикс, например:
 *   NEXT_PUBLIC_API_URL="https://example.com/api"
 */
export const axiosInstance = axios.create({
  baseURL: env.apiUrl,
  paramsSerializer: {
    indexes: null, // Используем формат ?size=S&size=M вместо ?size[]=S&size[]=M
  },
});

// Request interceptor: добавляем CSRF токен к мутационным запросам
axiosInstance.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();
    const isMutating = method && ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (isMutating) {
      const csrfToken = getCookie(CSRF_COOKIE_NAME);
      if (csrfToken) {
        config.headers[CSRF_HEADER_NAME] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Подавляем логирование 401 ошибок для /api/shop/profile (это ожидаемо при проверке авторизации)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Подавляем 401 ошибки для /api/shop/profile - это ожидаемо при проверке авторизации
    if (error.response?.status === 401) {
      const url = error.config?.url || error.response?.config?.url || "";
      if (url.includes("/shop/profile")) {
        // Возвращаем ошибку, но подавляем её логирование в консоли браузера
        // Это ожидаемое поведение при проверке авторизации для неавторизованных пользователей
        // Ошибка обрабатывается в React Query и не должна засорять консоль
        const mutedError = error;
        // Подавляем вывод ошибки в консоль, но сохраняем её для обработки в React Query
        Object.defineProperty(mutedError, "mute", { value: true, writable: false });
        return Promise.reject(mutedError);
      }
    }
    // Для всех остальных ошибок - стандартное поведение
    return Promise.reject(error);
  },
);

/**
 * Единое место, где храним пути к backend / Next API.
 *
 * Здесь учитываю реальные Next-маршруты:
 *   /app/api/shop/products/route.ts                → /api/shop/products
 *   /app/api/shop/product/[slug]/route.ts          → /api/shop/product/:slug
 *   /app/api/shop/cart/route.ts                    → /api/shop/cart
 *   /app/api/shop/cart/items/route.ts              → /api/shop/cart/items
 *   /app/api/shop/cart/items/[id]/route.ts         → /api/shop/cart/items/:id
 *   /app/api/shop/favorites/route.ts               → /api/shop/favorites
 *   /app/api/shop/favorites/[productId]/route.ts   → /api/shop/favorites/:productId
 *   /app/api/shop/orders/route.ts                  → /api/shop/orders
 *   /app/api/shop/orders/[uid]/route.ts            → /api/shop/orders/:uid
 *   /app/api/(admin)/products/route.ts               → /api/(admin)/products
 *   /app/api/(admin)/products/[slug]/route.ts        → /api/(admin)/products/:slug
 *   /app/api/(admin)/orders/[id]/route.ts            → /api/(admin)/orders/:id
 */
export enum ApiRoutes {
  SEARCH_PRODUCTS = "/shop/products",
  PRODUCT_ITEM = "/shop/product",

  CART = "/shop/cart",
  CART_ITEMS = "/shop/cart/items",

  FAVORITES = "/shop/favorites",

  CART_APPLY_PROMO = "/shop/cart/apply-promo",
  CART_CLEAR_PROMO = "/shop/cart/clear-promo",

  CATEGORIES = "/shop/categories",

  ORDERS = "/shop/orders",

  ADMIN_PRODUCTS = "/admin/products",
  ADMIN_ORDERS = "/admin/orders",

  ADMIN_PROMOS = "/admin/promos",

  ADMIN_DASHBOARD = "/admin/dashboard",
  ADMIN_BUSINESS_METRICS = "/admin/business-metrics",


  ADMIN_USERS = "/admin/users",

  ADMIN_NEWSLETTER_SUBSCRIBERS = "/admin/newsletter/subscribers",
  ADMIN_NEWSLETTER_ISSUES = "/admin/newsletter/issues",
}

/**
 * /api/shop/cart/items/:id
 */
export const buildCartItemUrl = (id: number | string) =>
  `${ApiRoutes.CART_ITEMS}/${id}`;

/**
 * /api/shop/product/:slug
 */
export const buildProductItemUrl = (slug: string) =>
  `${ApiRoutes.PRODUCT_ITEM}/${slug}`;

/**
 * /api/shop/favorites/:productId
 */
export const buildFavoriteUrl = (productId: number | string) =>
  `${ApiRoutes.FAVORITES}/${productId}`;

/**
 * /api/shop/orders/:uid
 */
export const buildOrderUrl = (uid: string | number) =>
  `${ApiRoutes.ORDERS}/${uid}`;

/**
 * /api/(admin)/products/:slug
 */
export const buildAdminProductUrl = (slug: string) =>
  `${ApiRoutes.ADMIN_PRODUCTS}/${slug}`;

/**
 * /api/(admin)/orders/:id
 */
export const buildAdminOrderUrl = (id: number | string) =>
  `${ApiRoutes.ADMIN_ORDERS}/${id}`;

/**
 * /api/shop/orders/:uid/cancel
 */
export const buildOrderCancelUrl = (uid: string | number) =>
  `${ApiRoutes.ORDERS}/${uid}/cancel`;

/**
 * /api/(admin)/promos/:id
 */
export const buildAdminPromoCodesUrl = (id: string | number) =>
  `${ApiRoutes.ADMIN_PROMOS}/${id}`;

/**
 * /api/(admin)/users/:id
 */
export const buildAdminUserUrl = (id: string | number) =>
  `${ApiRoutes.ADMIN_USERS}/${id}`;

/**
 * /api/admin/newsletter/subscribers/:id
 */
export const buildAdminNewsletterSubscriberUrl = (id: number | string) =>
  `${ApiRoutes.ADMIN_NEWSLETTER_SUBSCRIBERS}/${id}`;

/**
 * /api/admin/newsletter/issues/:id/send
 */
export const buildAdminNewsletterIssueSendUrl = (id: number | string) =>
  `${ApiRoutes.ADMIN_NEWSLETTER_ISSUES}/${id}/send`;
