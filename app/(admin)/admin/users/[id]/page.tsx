"use client";

import { TOAST } from "@/shared/constants";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
} from "@/shared/components/ui";

import { Spinner } from "@/shared/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { ADMIN_ORDER_STATUS_OPTIONS } from "@/shared/constants";
import { useAdminUserDetailQuery, useAdminUserUpdateRoleMutation } from "@/shared/hooks";
import { formatMoney } from "@/shared/lib/formatters";
import { DTO } from "@/shared/services";
import {
  Calendar,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  User,
} from "lucide-react";

type AdminUserPageParams = {
  id: string;
};

function getRoleLabel(role: DTO.UserRoleDto): string {
  return role === "ADMIN" ? "Администратор" : "Пользователь";
}

function RoleBadge({ role }: { role: DTO.UserRoleDto }) {
  const label = getRoleLabel(role);
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition-all ${
        isAdmin
          ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200/50"
          : "bg-gradient-to-r from-slate-100 to-zinc-100 text-slate-700 border border-slate-200/50"
      }`}
    >
      {label}
    </span>
  );
}

function getStatusLabel(status: DTO.OrderStatusDto): string {
  return ADMIN_ORDER_STATUS_OPTIONS.find((x) => x.value === status)?.label ?? status;
}

function getStatusBadgeVariant(
  status: DTO.OrderStatusDto
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "NEW":
    case "PENDING_PAYMENT":
      return "outline";
    case "PAID":
    case "PROCESSING":
      return "default";
    case "SHIPPED":
    case "DELIVERED":
      return "secondary";
    case "CANCELED":
      return "destructive";
    default:
      return "outline";
  }
}

export default function AdminUserDetailPage() {
  const params = useParams<AdminUserPageParams>();
  const id = params?.id;

  const detailQuery = useAdminUserDetailQuery(id);
  const updateRoleMutation = useAdminUserUpdateRoleMutation();

  const user = detailQuery.data;

  const [roleDraft, setRoleDraft] = React.useState<DTO.UserRoleDto>("USER");

  React.useEffect(() => {
    if (user?.role) setRoleDraft(user.role);
  }, [user?.role]);

  const handleRoleChange = async (next: DTO.UserRoleDto) => {
    if (!user) return;
    if (next === user.role) return;

    const prev = roleDraft;
    setRoleDraft(next);

    try {
      await updateRoleMutation.mutateAsync({
        id: user.id,
        payload: { role: next },
      });

      toast.success(TOAST.SUCCESS.ROLE_UPDATED);
      detailQuery.refetch();
    } catch {
      // Ошибка уже обработана в toast
      setRoleDraft(prev);
      toast.error(TOAST.ERROR.FAILED_TO_UPDATE_ROLE);
    }
  };

  if (detailQuery.isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        {/* Заголовок */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </header>

        <Separator />

        <div className="space-y-6">
          {/* Профиль и метрики */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-blue-50/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-blue-100/50 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-3 w-32" />
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-emerald-100/50 bg-gradient-to-br from-emerald-50/30 to-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Последние заказы */}
          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-indigo-50/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
                <div className="space-y-0">
                  {/* Заголовок таблицы */}
                  <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  {/* Строки таблицы */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-border/30 h-14 flex items-center gap-4 px-4"
                    >
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-32 font-mono" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-4 w-12 ml-auto" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !user) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base">Не удалось загрузить пользователя</CardTitle>
            <CardDescription className="text-xs">
              {detailQuery.error instanceof Error
                ? detailQuery.error.message
                : "Попробуй обновить страницу."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const fullName = [user.secondName, user.name].filter(Boolean).join(" ").trim() || "Без имени";

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/admin/users" className="text-xs text-muted-foreground hover:underline">
              ← К пользователям
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <RoleBadge role={user.role} />
          </div>
        </div>
      </header>

      <Separator />

      <div className="space-y-6">
        {/* Профиль и метрики */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-blue-50/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">Профиль</CardTitle>
              </div>
              <CardDescription className="text-xs">Информация о пользователе</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border border-blue-100/50 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email
                    </Label>
                    <div className="text-sm font-medium">{user.email}</div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Телефон
                    </Label>
                    <div className="text-sm font-medium">{user.phone || "—"}</div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      Дата регистрации
                    </Label>
                    <div className="text-sm font-medium">
                      {new Date(user.createdAt).toLocaleString("ru-RU")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="user-role"
                      className="text-xs font-medium flex items-center gap-1.5"
                    >
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      Роль
                    </Label>
                    <Select
                      value={roleDraft}
                      onValueChange={(v) => handleRoleChange(v as DTO.UserRoleDto)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Выбери роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Пользователь</SelectItem>
                        <SelectItem value="ADMIN">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                    {updateRoleMutation.isPending && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Spinner className="h-3 w-3" />
                        Сохранение...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-base font-semibold">Метрики</CardTitle>
              </div>
              <CardDescription className="text-xs">Статистика покупок</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border border-emerald-100/50 bg-gradient-to-br from-emerald-50/30 to-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Заказов
                  </div>
                  <span className="text-sm font-semibold">{user.ordersCount}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    Потратил
                  </div>
                  <span className="text-sm font-semibold">{formatMoney(user.totalSpent)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Последний заказ
                  </div>
                  <span className="text-sm font-semibold">
                    {user.lastOrderAt
                      ? new Date(user.lastOrderAt).toLocaleDateString("ru-RU", {
                          timeZone: "Europe/Moscow",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Последние заказы */}
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-indigo-50/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">Последние заказы</CardTitle>
            </div>
            <CardDescription className="text-xs">Последние 20 заказов пользователя</CardDescription>
          </CardHeader>

          <CardContent>
            {user.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Заказов пока нет.</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Заказ</TableHead>
                      <TableHead>UID</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Позиций</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead className="pr-4">Дата</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {user.orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="pl-4 text-sm">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-medium hover:underline"
                          >
                            #{o.id}
                          </Link>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                          {o.uid}
                        </TableCell>

                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(o.status)}>
                            {getStatusLabel(o.status)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right text-sm font-medium">
                          {o.totalItems}
                        </TableCell>

                        <TableCell className="text-right text-sm font-semibold">
                          {formatMoney(o.total)}
                        </TableCell>

                        <TableCell className="pr-4 text-sm text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString("ru-RU", {
                            timeZone: "Europe/Moscow",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
