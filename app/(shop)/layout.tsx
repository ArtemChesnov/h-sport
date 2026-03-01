import { ShopLayout } from "@/shared/components/layouts/ShopLayout";
import { ShopQueryProvider } from "./shop-query-provider";

export default function ShopLayoutRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ShopLayout>
      <ShopQueryProvider>{children}</ShopQueryProvider>
    </ShopLayout>
  );
}
