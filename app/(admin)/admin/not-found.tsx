import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Страница не найдена</p>
      <Button asChild>
        <Link href="/admin">Вернуться на главную</Link>
      </Button>
    </div>
  );
}
