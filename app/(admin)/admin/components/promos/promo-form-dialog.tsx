
"use client";

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from "@/shared/components/ui";
import { Separator } from "@/shared/components/ui/separator";
import { TOAST } from "@/shared/constants";
import { getErrorMessage } from "@/shared/lib/errors";
import {
    validateMinOrder,
    validatePromoCode,
    validatePromoValue,
    validateUsageLimit,
} from "@/shared/lib/promo";
import { useServerFormErrors } from "@/shared/lib/validation";
import { DTO } from "@/shared/services";
import { Calendar, DollarSign, Hash, Percent, Power, ShoppingCart, Ticket } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { rubToKopecks, toEndOfDayIso, toStartOfDayIso } from "../../lib/promos";
import { PromoPeriodPicker } from "./promo-period-picker";

type PromoType = DTO.PromoTypeDto;

type PromoFormDialogProps = {
  onCreate: (payload: DTO.AdminPromoCodeCreateDto) => Promise<void>;
  isCreating: boolean;
};

/**
 * Диалог создания промокода.
 */
export function PromoFormDialog(props: PromoFormDialogProps) {
  const { onCreate, isCreating } = props;
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PromoType>("PERCENT");
  const [code, setCode] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [minOrder, setMinOrder] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [period, setPeriod] = useState<DateRange | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLifetime, setIsLifetime] = useState<boolean>(false);

  const {
    formErrors,
    resetFormErrors,
    handleServerError,
  } = useServerFormErrors();

  function resetForm() {
    setType("PERCENT");
    setCode("");
    setValue("");
    setMinOrder("");
    setUsageLimit("");
    setPeriod(undefined);
    setIsActive(true);
    setIsLifetime(false);
    resetFormErrors();
  }

  function handleSubmit() {
    const codeUpper = code.trim().toUpperCase();

    const codeCheck = validatePromoCode(codeUpper);
    if (!codeCheck.valid) {
      toast.error(TOAST.ERROR.PROMO_CODE_REQUIRED, { description: codeCheck.error });
      return;
    }

    const rawValue = Number(value);
    if (!Number.isFinite(rawValue)) {
      toast.error(TOAST.ERROR.INVALID_VALUE, {
        description: type === "AMOUNT" ? "Введи сумму в рублях" : "Введи процент",
      });
      return;
    }
    const valueCheck = validatePromoValue(rawValue, type);
    if (!valueCheck.valid) {
      toast.error(TOAST.ERROR.INVALID_VALUE, { description: valueCheck.error });
      return;
    }

    const rawMin = minOrder ? Number(minOrder) : null;
    if (rawMin !== null && !Number.isFinite(rawMin)) {
      toast.error(TOAST.ERROR.INVALID_MIN_ORDER, {
        description: "Введите число или оставьте пустым",
      });
      return;
    }
    const minOrderCheck = validateMinOrder(rawMin);
    if (!minOrderCheck.valid) {
      toast.error(TOAST.ERROR.INVALID_MIN_ORDER, {
        description: minOrderCheck.error,
      });
      return;
    }

    const rawLimit = usageLimit ? Number(usageLimit) : null;
    if (rawLimit !== null && (!Number.isFinite(rawLimit) || !Number.isInteger(rawLimit))) {
      toast.error(TOAST.ERROR.INVALID_LIMIT, {
        description: "Введите целое число или оставьте пустым",
      });
      return;
    }
    const limitCheck = validateUsageLimit(rawLimit);
    if (!limitCheck.valid) {
      toast.error(TOAST.ERROR.INVALID_LIMIT, { description: limitCheck.error });
      return;
    }

    const valueInKopecks =
      type === "AMOUNT" ? rubToKopecks(rawValue) : Math.round(rawValue);
    const minOrderInKopecks = rawMin === null ? null : rubToKopecks(rawMin);

    let startsAt: string | null = null;
    let endsAt: string | null = null;

    if (isLifetime) {
      const now = new Date();
      startsAt = toStartOfDayIso(now);
      endsAt = null;
    } else {
      startsAt = period?.from ? toStartOfDayIso(period.from) : null;
      endsAt = period?.to ? toEndOfDayIso(period.to) : null;
    }

    resetFormErrors();

    onCreate({
      code: codeUpper,
      type,
      value: valueInKopecks,
      minOrder: minOrderInKopecks,
      usageLimit: rawLimit === null ? null : rawLimit,
      startsAt,
      endsAt,
      isActive,
    })
      .then(() => {
        toast.success(TOAST.SUCCESS.PROMO_CREATED, {
          description: `Код: ${codeUpper}`,
        });
        resetForm();
        setOpen(false);
      })
      .catch((error) => {
        handleServerError(error);
        toast.error(TOAST.ERROR.FAILED_TO_CREATE_PROMO, {
          description: getErrorMessage(error),
        });
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer">
          Создать промокод
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="h-5 w-5 text-amber-600" />
            <DialogTitle className="text-base font-semibold">Создать промокод</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Заполните информацию о промокоде
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основная информация */}
          <div className="rounded-lg border border-amber-100/50 bg-gradient-to-br from-amber-50/30 to-white p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-amber-600" />
              <div className="text-sm font-semibold text-foreground">Основная информация</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-code" className="text-xs font-medium">Код промокода *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="create-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className={`pl-9 h-9 font-mono text-xs ${formErrors.code ? "border-destructive" : ""}`}
                />
              </div>
              {formErrors.code && (
                <p className="text-xs text-destructive mt-1">{formErrors.code}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-type" className="text-xs font-medium">Тип *</Label>
                <Select value={type} onValueChange={(v) => setType(v as PromoType)}>
                  <SelectTrigger id="create-type" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Процентный</SelectItem>
                    <SelectItem value="AMOUNT">Фиксированная сумма</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-value" className="text-xs font-medium">
                  {type === "PERCENT" ? "Процент (%) *" : "Сумма (₽) *"}
                </Label>
                <div className="relative">
                  {type === "PERCENT" ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  )}
                  <Input
                    id="create-value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "PERCENT" ? "10" : "500"}
                    className={`pl-9 h-9 ${formErrors.value ? "border-destructive" : ""}`}
                  />
                </div>
                {formErrors.value && (
                  <p className="text-xs text-destructive mt-1">{formErrors.value}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Условия применения */}
          <div className="rounded-lg border border-blue-100/50 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-semibold text-foreground">Условия применения</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-min-order" className="text-xs font-medium">
                  Минимальный заказ, ₽
                </Label>
                <Input
                  id="create-min-order"
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="1000"
                  className={`h-9 ${formErrors.minOrder ? "border-destructive" : ""}`}
                />
                {formErrors.minOrder && (
                  <p className="text-xs text-destructive mt-1">{formErrors.minOrder}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-usage-limit" className="text-xs font-medium">
                  Лимит использований
                </Label>
                <Input
                  id="create-usage-limit"
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="100"
                  className={`h-9 ${formErrors.usageLimit ? "border-destructive" : ""}`}
                />
                {formErrors.usageLimit && (
                  <p className="text-xs text-destructive mt-1">{formErrors.usageLimit}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Период действия */}
          <div className="rounded-lg border border-emerald-100/50 bg-gradient-to-br from-emerald-50/30 to-white p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <div className="text-sm font-semibold text-foreground">Период действия</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="create-lifetime"
                  checked={isLifetime}
                  onCheckedChange={setIsLifetime}
                  className="cursor-pointer"
                />
                <Label htmlFor="create-lifetime" className="text-xs font-medium cursor-pointer">
                  Бессрочный промокод
                </Label>
              </div>

              <PromoPeriodPicker
                value={period}
                onChange={setPeriod}
                error={formErrors.period}
                disabled={isLifetime}
              />
            </div>
          </div>

          <Separator />

          {/* Статус */}
          <div className="rounded-lg border border-purple-100/50 bg-gradient-to-br from-purple-50/30 to-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Power className="h-4 w-4 text-purple-600" />
              <div className="text-sm font-semibold text-foreground">Статус</div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="create-active"
                checked={isActive}
                onCheckedChange={setIsActive}
                className="cursor-pointer"
              />
              <Label htmlFor="create-active" className="text-xs font-medium cursor-pointer">
                Активен
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            disabled={isCreating}
            className="h-9 cursor-pointer"
          >
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="h-9 min-w-[140px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {isCreating ? "Создание..." : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

