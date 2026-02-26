/**
 * Loading для корзины. Скелетон под оверлеем.
 */
import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import { CartPageSkeleton } from "./_components/cart-page-skeleton";

export default function CartLoading() {
  return (
    <main className="pb-20">
      <Container>
        <ShopBreadcrumbs />
        <div className="mt-[60px]">
          <CartPageSkeleton />
        </div>
      </Container>
    </main>
  );
}
