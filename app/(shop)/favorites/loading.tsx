/**
 * Loading для избранного. Скелетон в том же контейнере, что и страница.
 */
import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import { FavoritesPageSkeleton } from "@/shared/components/common/skeleton";

export default function FavoritesLoading() {
  return (
    <Container className="">
      <ShopBreadcrumbs />
      <FavoritesPageSkeleton variant="full" />
    </Container>
  );
}
