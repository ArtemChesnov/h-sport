export * as DTO from "./dto";

// --- SHOP clients (витрина) ---
export * as CART_CLIENT from "./api/shop/cart/cart.service";
export * as CATEGORIES_CLIENT from "./api/shop/categories/categories.service";
export * as FAVORITES_CLIENT from "./api/shop/favorites/favorites.service";
export {
  addFavorite,
  fetchFavorites,
  removeFavorite,
} from "./api/shop/favorites/favorites.service";
export * as ORDER_CANCEL_CLIENT from "./api/shop/orders/orders-cancel.service";
export * as ORDER_CLIENT from "./api/shop/orders/orders.service";
export * as PRODUCT_ITEM_CLIENT from "./api/shop/product/product-item.service";
export * as PRODUCT_CLIENT from "./api/shop/product/products.service";
export * as PROMO_CLIENT from "./api/shop/promo/promo.service";
export * as USER_CLIENT from "./api/shop/user/user.service";

// --- ADMIN clients ---
export {
  fetchBusinessMetrics,
  type BusinessMetricsResponse,
} from "./api/admin/admin.business-metrics.service";
export * as DASHBOARD_CLIENT_ADMIN from "./api/admin/admin.dashboard.service";
export { fetchAdminDashboardStats } from "./api/admin/admin.dashboard.service";
export * as ORDER_CLIENT_ADMIN from "./api/admin/admin.orders.service";
export {
  fetchAdminOrder,
  fetchAdminOrders,
  updateAdminOrder,
} from "./api/admin/admin.orders.service";
export * as PRODUCT_CLIENT_ADMIN from "./api/admin/admin.products.service";
export * as PROMO_CLIENT_ADMIN from "./api/admin/admin.promos.service";

// --- USERS ((admin)) ---
export * as USER_CLIENT_ADMIN from "./api/admin/admin.users.service";
export {
  fetchAdminUser,
  fetchAdminUsers,
  updateAdminUserRole,
} from "./api/admin/admin.users.service";

// --- NEWSLETTER (admin) ---
export * as NEWSLETTER_CLIENT_ADMIN from "./api/admin/admin.newsletter.service";
export type {
  AdminNewsletterIssueDto,
  AdminNewsletterSubscribersQueryDto,
  AdminSubscriberDto,
  PaginatedResponse,
} from "./api/admin/admin.newsletter.service";
export {
  createAdminNewsletterIssue,
  deleteAdminNewsletterSubscriber,
  fetchAdminNewsletterIssues,
  fetchAdminNewsletterSubscribers,
  sendAdminNewsletterIssue,
} from "./api/admin/admin.newsletter.service";

// --- AUTH ---
export { signout, fetchAuthMe, type AuthMeUser } from "./api";

// --- SERVER services (для Server Components и API routes) ---
export * as PRODUCT_SERVER from "./server/shop/product/products.service";
