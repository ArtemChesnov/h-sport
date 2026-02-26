"use client";

import { TOAST } from "@/shared/constants";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminOrderDetailQuery, useAdminOrderUpdateMutation } from "@/shared/hooks";
import { DTO } from "@/shared/services";

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui";

import { Spinner } from "@/shared/components/ui/spinner";
import { Edit, Hash, Mail, MapPin, Phone, Truck, User } from "lucide-react";

import { ADMIN_ORDER_DELIVERY_METHOD_OPTIONS, ADMIN_ORDER_STATUS_OPTIONS } from "@/shared/constants";
import { getOrderStatusBadgeStyles } from "@/shared/lib/styles";
import { OrderItemsCard, OrderPaymentsCard, OrderSkeleton } from "./_components";

type AdminOrderPageParams = { id: string };

type AdminOrderFormState = {
  status: DTO.OrderStatusDto;
  email: string;
  phone: string;
  fullName: string;
  deliveryMethod?: DTO.DeliveryMethodDto;
  deliveryCity: string;
  deliveryAddress: string;
  trackingCode: string;
};

function orderToFormState(order: DTO.OrderDetailDto): AdminOrderFormState {
  return {
    status: order.status,
    email: order.email,
    phone: order.phone ?? "",
    fullName: order.fullName ?? "",
    deliveryMethod: order.delivery?.method,
    deliveryCity: order.delivery?.city ?? "",
    deliveryAddress: order.delivery?.address ?? "",
    trackingCode: order.delivery?.trackingCode ?? "",
  };
}

function getStatusLabel(status: DTO.OrderStatusDto): string {
  return ADMIN_ORDER_STATUS_OPTIONS.find((x) => x.value === status)?.label ?? status;
}

export default function AdminOrderPage() {
  const params = useParams<AdminOrderPageParams>();
  const id = Number(params?.id);

  const { data: order, isLoading, isError, error } = useAdminOrderDetailQuery(Number.isFinite(id) ? id : null);

  if (isLoading) {
    return <OrderSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base">Не удалось загрузить заказ</CardTitle>
            <CardDescription className="text-xs">
              {error instanceof Error ? error.message : "Попробуй обновить страницу."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <AdminOrderPageContent key={order.id} order={order} />;
}

type AdminOrderPageContentProps = { order: DTO.OrderDetailDto };

function AdminOrderPageContent({ order }: AdminOrderPageContentProps) {
  const updateMutation = useAdminOrderUpdateMutation();
  const isSaving = updateMutation.isPending;

  const [orderView, setOrderView] = useState<DTO.OrderDetailDto>(order);
  const [formState, setFormState] = useState<AdminOrderFormState>(() => orderToFormState(order));
  const [baseOrder, setBaseOrder] = useState<DTO.OrderDetailDto>(order);

  type TextFieldKey = "email" | "phone" | "fullName" | "deliveryCity" | "deliveryAddress" | "trackingCode";

  const handleTextChange = (field: TextFieldKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleStatusChange = (value: string) => {
    setFormState((prev) => ({ ...prev, status: value as DTO.OrderStatusDto }));
  };

  const handleDeliveryMethodChange = (value: string) => {
    const newMethod = value as DTO.DeliveryMethodDto;
    setFormState((prev) => {
      const updated = { ...prev, deliveryMethod: newMethod };
      if (newMethod === "PICKUP_SHOWROOM") {
        updated.trackingCode = "";
      }
      return updated;
    });
  };

  const isTrackingCodeDisabled = formState.deliveryMethod === "PICKUP_SHOWROOM";
  const statusLabel = useMemo(() => getStatusLabel(orderView.status), [orderView.status]);

  const hasPaidPayment = useMemo(() => {
    return orderView.payments?.some((payment) => payment.status === "PAID") ?? false;
  }, [orderView.payments]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: DTO.OrderAdminUpdateRequestDto = {};

    if (formState.status !== baseOrder.status) payload.status = formState.status;
    if (formState.email !== baseOrder.email) payload.email = formState.email;
    if (formState.phone !== (baseOrder.phone ?? "")) payload.phone = formState.phone;
    if (formState.fullName !== (baseOrder.fullName ?? "")) payload.fullName = formState.fullName;

    if (formState.deliveryMethod && formState.deliveryMethod !== baseOrder.delivery?.method) {
      payload.deliveryMethod = formState.deliveryMethod;
    }
    if (formState.deliveryCity !== (baseOrder.delivery?.city ?? "")) payload.deliveryCity = formState.deliveryCity;
    if (formState.deliveryAddress !== (baseOrder.delivery?.address ?? "")) payload.deliveryAddress = formState.deliveryAddress;

    if (formState.deliveryMethod !== "PICKUP_SHOWROOM") {
      if (formState.trackingCode !== (baseOrder.delivery?.trackingCode ?? "")) {
        payload.trackingCode = formState.trackingCode;
      }
    } else {
      if (baseOrder.delivery?.trackingCode) {
        payload.trackingCode = null;
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.info(TOAST.INFO.NO_CHANGES);
      return;
    }

    try {
      const updated = await updateMutation.mutateAsync({ id: baseOrder.id, payload });
      setOrderView(updated);
      setBaseOrder(updated);
      setFormState(orderToFormState(updated));
      toast.success(TOAST.SUCCESS.ORDER_UPDATED);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : TOAST.ERROR.FAILED_TO_UPDATE_ORDER);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Заголовок */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
                ← К заказам
              </Link>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Заказ №{orderView.id}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Создан: {new Date(orderView.createdAt).toLocaleString("ru-RU")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${getOrderStatusBadgeStyles(orderView.status)}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Форма редактирования */}
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-indigo-50/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Edit className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">Редактирование заказа</CardTitle>
            </div>
            <CardDescription className="text-xs">
              При добавлении трека к оплаченному заказу статус может автоматически измениться
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Раздел: Статус и трекинг */}
              <div className="rounded-lg border border-indigo-100/50 bg-gradient-to-br from-indigo-50/30 to-white p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-indigo-600" />
                  <div className="text-sm font-semibold text-foreground">Статус и отправка</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs font-medium">Статус заказа</Label>
                    <Select value={formState.status} onValueChange={handleStatusChange} disabled={isSaving}>
                      <SelectTrigger id="status" className="h-9">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADMIN_ORDER_STATUS_OPTIONS.map((option) => {
                          const statusesRequiringPayment: DTO.OrderStatusDto[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
                          const requiresPayment = statusesRequiringPayment.includes(option.value);
                          const isDisabled = requiresPayment && !hasPaidPayment;

                          return (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              disabled={isDisabled}
                              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              {option.label}
                              {isDisabled && " (требуется оплата)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingCode" className="text-xs font-medium">
                      Трек-номер
                      {isTrackingCodeDisabled && (
                        <span className="ml-2 text-[10px] text-muted-foreground font-normal">
                          (не требуется для самовывоза)
                        </span>
                      )}
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="trackingCode"
                        value={formState.trackingCode}
                        onChange={handleTextChange("trackingCode")}
                        disabled={isSaving || isTrackingCodeDisabled}
                        placeholder={isTrackingCodeDisabled ? "Не требуется" : "CDEK123456789"}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Раздел: Контакты */}
              <div className="rounded-lg border border-blue-100/50 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div className="text-sm font-semibold text-foreground">Контакты клиента</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        value={formState.email}
                        onChange={handleTextChange("email")}
                        disabled={isSaving}
                        placeholder="client@mail.ru"
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-medium">Телефон</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="phone"
                        value={formState.phone}
                        onChange={handleTextChange("phone")}
                        disabled={isSaving}
                        placeholder="+7 (999) 123-45-67"
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-medium">ФИО</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="fullName"
                      value={formState.fullName}
                      onChange={handleTextChange("fullName")}
                      disabled={isSaving}
                      placeholder="Иванов Иван Иванович"
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Раздел: Доставка */}
              <div className="rounded-lg border border-emerald-100/50 bg-gradient-to-br from-emerald-50/30 to-white p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  <div className="text-sm font-semibold text-foreground">Доставка</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryMethod" className="text-xs font-medium">Способ доставки</Label>
                    <Select
                      value={formState.deliveryMethod}
                      onValueChange={handleDeliveryMethodChange}
                      disabled={isSaving}
                    >
                      <SelectTrigger id="deliveryMethod" className="h-9">
                        <SelectValue placeholder="Выберите способ доставки" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADMIN_ORDER_DELIVERY_METHOD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryCity" className="text-xs font-medium">Город</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="deliveryCity"
                        value={formState.deliveryCity}
                        onChange={handleTextChange("deliveryCity")}
                        disabled={isSaving}
                        placeholder="Нижний Новгород"
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress" className="text-xs font-medium">Адрес / ПВЗ / шоурум</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="deliveryAddress"
                      value={formState.deliveryAddress}
                      onChange={handleTextChange("deliveryAddress")}
                      disabled={isSaving}
                      placeholder="ул. Ленина, д. 1, кв. 10"
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </div>

              <CardFooter className="flex justify-end gap-2 px-0 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="min-w-[180px] h-9 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {isSaving && <Spinner className="mr-2 h-3 w-3" />}
                  Сохранить изменения
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        {/* Состав заказа */}
        <OrderItemsCard order={orderView} />

        {/* Платежи */}
        {orderView.payments && orderView.payments.length > 0 && (
          <OrderPaymentsCard order={orderView} />
        )}
      </div>
    </div>
  );
}
