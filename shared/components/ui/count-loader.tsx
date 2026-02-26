/**
 * Inline-лоадер для счётчиков (избранное, корзина в Header).
 */
export function CountLoader() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#EB6081] border-t-transparent"
      aria-hidden
    />
  );
}
