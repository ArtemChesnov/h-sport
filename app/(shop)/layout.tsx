import { ShopLayout } from "@/shared/components/layouts/ShopLayout";

export default function ShopLayoutRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ShopLayout>{children}</ShopLayout>;
}
