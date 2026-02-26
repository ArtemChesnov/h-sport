
// --- Shop (витрина) ---
export { addCartItem, deleteCartItem, fetchCart, updateCartItem } from "./shop/cart/cart.service";
export { fetchCategories } from "./shop/categories/categories.service";
export { addFavorite, fetchFavorites, removeFavorite } from "./shop/favorites/favorites.service";
export { cancelOrder } from "./shop/orders/orders-cancel.service";
export { fetchOrdersList,
    fetchOrder,
    createOrder } from "./shop/orders/orders.service";
export { fetchProduct } from "./shop/product/product-item.service";
export { fetchProducts } from "./shop/product/products.service";
export { applyPromoCode } from "./shop/promo/promo.service";
export { fetchUserProfile, updateUserProfile } from "./shop/user/user.service";

// --- Auth ---
export { signout } from "./auth/auth.service";

// --- Admin (админка) ---
export {
    fetchAdminProduct,
    fetchAdminProducts,
    createProduct,
    deleteProduct,
    updateProduct,
} from "./admin/admin.products.service";

export { fetchAdminOrder, fetchAdminOrders, updateAdminOrder } from "./admin/admin.orders.service";

export {
  fetchAdminPromoCodes,
  createAdminPromoCode,
  updateAdminPromoCode,
  deleteAdminPromoCode,
} from "./admin/admin.promos.service";


