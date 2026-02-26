/** Серверные сервисы (Prisma). Структура: shop, admin, payment, auth. */

// --- Auth ---
export * from "./auth/auth.service";

// --- Health ---
export * from "./health/health.service";

// --- Shop ---
export * from "./shop/filters/filters.service";
export * from "./shop/cart/cart-items.service";
export * from "./shop/cart/cart-session.service";
export * from "./shop/categories/categories.service";
export * from "./shop/favorites/favorites.service";
export * from "./shop/newsletter/newsletter.service";
export * from "./shop/orders/orders.service";
export { CatalogProductsService } from "./shop/product/catalog-products.service";
export * from "./shop/product/products.service";
export * from "./shop/profile/profile.service";
export * from "./shop/promo/promo.service";

// --- Admin ---
export * from "./admin/advanced-metrics.service";
export * from "./admin/dashboard.service";
export * from "./admin/metrics-export.service";
export * from "./admin/newsletter.service";
export * from "./admin/orders/orders.service";
export * from "./admin/products.service";
export * from "./admin/promos.service";
export * from "./admin/upload.service";
export * from "./admin/users.service";

// --- Payment ---
export { OrderForPaymentService } from "./payment/order-for-payment.service";
export * from "./payment/receipt.service";
export * from "./payment/webhook.service";

// --- Sitemap ---
export * from "./sitemap/sitemap.service";

// --- Metrics (route facade) ---
// Note: metrics-route.service is imported directly by routes,
// not re-exported here to avoid name collisions with admin/metrics-export.service
// (both export parseMetricType, parsePeriodDays, etc.).

