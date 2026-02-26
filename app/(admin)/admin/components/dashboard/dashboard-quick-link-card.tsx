
"use client";

import React from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";

/**
 * Карточка быстрого перехода из дашборда.
 *
 * @param props.title       Заголовок карточки (например, "Заказы").
 * @param props.description Краткое описание раздела.
 * @param props.href        Ссылка на раздел админки.
 */
export type DashboardQuickLinkCardProps = {
  title: string;
  description: string;
  href: string;
};

export function DashboardQuickLinkCard(props: DashboardQuickLinkCardProps) {
  const { title, description, href } = props;

  return (
    <Card className="flex flex-col justify-between shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full justify-between"
        >
          <Link href={href}>
            Открыть
            <span className="ml-1">→</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
