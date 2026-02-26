import Link from "next/link";
import {Container} from "@/shared/components/common";

/**
 * Техническая страница-индекс для /product.
 *
 * Основные карточки товаров ведут на /product/:slug.
 * Но иногда пользователь может открыть /product напрямую.
 */
export default function ProductIndexPage() {
    return (
        <Container className="">
            <div className="mx-auto flex max-w-[720px] flex-col gap-4 text-center">
                <h1 className="text-2xl font-semibold">Выбери товар</h1>
                <p className="text-muted-foreground">
                    Страница товара открывается по ссылке вида <span className="font-medium">/product/slug</span>.
                </p>

                <div className="mt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm hover:bg-accent"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </Container>
    );
}
