"use client";

import { TOAST } from "@/shared/constants";
import { useAdminOrdersListQuery } from "@/shared/hooks";
import type { DTO } from "@/shared/services";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ADMIN_ORDER_STATUS_FILTER_VALUES } from "../lib/constants";

export type StatusFilterValue = "ALL" | DTO.OrderStatusDto;

function isOrderStatus(value: string | null): value is DTO.OrderStatusDto {
  if (!value) return false;
  return (ADMIN_ORDER_STATUS_FILTER_VALUES as readonly string[]).includes(value);
}

function parseQueryParams(searchParams: URLSearchParams): DTO.AdminOrdersQueryDto {
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const perPage = Number(searchParams.get("perPage") ?? "20") || 20;
  const statusRaw = searchParams.get("status");
  const status = isOrderStatus(statusRaw) ? statusRaw : undefined;
  const email = searchParams.get("email") || undefined;
  return { page, perPage, status, email };
}

function buildSearchString(params: DTO.AdminOrdersQueryDto): string {
  const sp = new URLSearchParams();
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.perPage && params.perPage !== 20) sp.set("perPage", String(params.perPage));
  if (params.status) sp.set("status", params.status);
  if (params.email) sp.set("email", params.email);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Хук страницы списка заказов админки: парсинг URL, фильтры, запрос, пагинация.
 */
export function useAdminOrdersQuery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => parseQueryParams(searchParams), [searchParams]);

  const [statusValue, setStatusValue] = useState<StatusFilterValue>(params.status ?? "ALL");
  const [emailValue, setEmailValue] = useState<string>(params.email ?? "");

  const { data, isLoading, isError, error } = useAdminOrdersListQuery(params);
  const totalPages = data?.meta.pages ?? 1;

  useEffect(() => {
    if (!isError) return;
    toast.error(TOAST.ERROR.LOAD_ORDERS, {
      description: error instanceof Error ? error.message : "Неизвестная ошибка",
    });
  }, [isError, error]);

  const handleFiltersSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextParams: DTO.AdminOrdersQueryDto = {
      page: 1,
      perPage: params.perPage,
      status: statusValue === "ALL" ? undefined : statusValue,
      email: emailValue.trim() || undefined,
    };
    router.push(`/admin/orders${buildSearchString(nextParams)}`);
  };

  const handleResetFilters = () => {
    const nextParams: DTO.AdminOrdersQueryDto = {
      page: 1,
      perPage: params.perPage,
      status: undefined,
      email: undefined,
    };
    setStatusValue("ALL");
    setEmailValue("");
    router.push(`/admin/orders${buildSearchString(nextParams)}`);
  };

  const handlePageChange = (nextPage: number) => {
    if (!data) return;
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    const nextParams: DTO.AdminOrdersQueryDto = { ...params, page: safePage };
    router.push(`/admin/orders${buildSearchString(nextParams)}`);
  };

  return {
    params,
    statusValue,
    setStatusValue,
    emailValue,
    setEmailValue,
    data,
    isLoading,
    isError,
    totalPages,
    handleFiltersSubmit,
    handleResetFilters,
    handlePageChange,
  };
}
