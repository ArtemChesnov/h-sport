"use client";

import { AddressFields } from "@/shared/components/common/address/address-fields";
import { DesignButton, Spinner } from "@/shared/components/ui";
import { TOAST } from "@/shared/constants";
import { buildFullAddressLine } from "@/shared/hooks/checkout/checkout.hooks";
import React from "react";
import { toast } from "sonner";
import type { AddressFormData, AddressFormErrors } from "../lib/profile-form-utils";

type AddressFormProps = {
  initialData: AddressFormData;
  onSave: (data: { address: { country: string; city: string; street: string } }) => Promise<void>;
  onReset: () => AddressFormData;
};

export function AddressForm({ initialData, onSave, onReset }: AddressFormProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [form, setForm] = React.useState<AddressFormData>(initialData);
  const [errors, setErrors] = React.useState<AddressFormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = React.useCallback((patch: Partial<AddressFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof AddressFormData)[]) {
        delete next[key];
      }
      return next;
    });
  }, []);

  const handleEdit = React.useCallback(() => {
    setIsEditing(true);
    setErrors({});
  }, []);

  const handleCancel = React.useCallback(() => {
    setIsEditing(false);
    setErrors({});
    setForm(onReset());
  }, [onReset]);

  const validate = React.useCallback((): boolean => {
    const nextErrors: AddressFormErrors = {};
    const hasAny = form.city || form.street || form.house || form.apartment;
    if (hasAny) {
      if (!form.country.trim()) nextErrors.country = "Укажите страну";
      if (!form.city.trim()) nextErrors.city = "Укажите город";
      if (!form.street.trim()) nextErrors.street = "Укажите улицу";
      if (!form.house.trim()) nextErrors.house = "Укажите дом";
      if (!form.apartment.trim()) nextErrors.apartment = "Укажите квартиру";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting || !validate()) return;

      setIsSubmitting(true);
      try {
        const streetLine = buildFullAddressLine({
          street: form.street,
          house: form.house,
          entrance: form.entrance,
          apartment: form.apartment,
        });

        await onSave({
          address: {
            country: form.country.trim(),
            city: form.city.trim(),
            street: streetLine || form.street.trim(),
          },
        });
        toast.success(TOAST.SUCCESS.ADDRESS_SAVED);
        setIsEditing(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Попробуйте позже";
        toast.error(TOAST.ERROR.FAILED_TO_SAVE_ADDRESS, { description: message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isSubmitting, onSave, validate]
  );

  return (
    <form id="address-form" onSubmit={handleSubmit} noValidate className="mt-4 min-[873px]:mt-6 min-[1024px]:mt-5">
      <h1 className="text-[22px] leading-[100%] font-semibold max-[576px]:text-[22px] min-[873px]:text-[32px] min-[1024px]:text-[38px]">
        Адрес
      </h1>

      <div className="w-full h-0.75 bg-primary my-4 min-[873px]:my-6 min-[1024px]:my-8" />

      <div className="flex justify-between max-[1440px]:gap-8 max-[1024px]:flex-col max-[1090px]:gap-6">
        <p className="leading-[130%] font-normal text-[14px] text-muted-foreground max-w-78.25 max-[1900px]:max-w-62.25 min-[1024px]:text-[16px] max-[1090px]:max-w-full">
          Актуальные контактные данные помогут вам вовремя получать уведомления
          <br className="max-[576px]:hidden" />о статусе ваших заказов
        </p>

        <div className="flex flex-col items-start max-[576px]:items-stretch max-[1090px]:ml-0 max-[1440px]:ml-auto ml-33 w-full">
          <AddressFields
            values={form}
            onChange={handleChange}
            errors={errors}
            disabled={!isEditing}
            showRequiredAsterisk={false}
          />

          <div className="flex flex-wrap gap-4 mt-6 max-[576px]:flex-col max-[576px]:w-full max-[576px]:gap-4 min-[873px]:gap-5 min-[873px]:mt-8 min-[1024px]:mt-10">
            <div className="max-[576px]:w-full">
              <DesignButton
                type="submit"
                variant="default"
                className="w-53.75 h-14 max-[576px]:flex max-[576px]:w-full max-[576px]:max-w-none"
                disabled={!isEditing || isSubmitting}
              >
                {isSubmitting ? <Spinner className="h-5 w-5" /> : "Сохранить"}
              </DesignButton>
            </div>
            <div className="max-[576px]:w-full">
              <DesignButton
                type="button"
                variant="outline"
                className="w-53.75 h-14 max-[576px]:flex max-[576px]:w-full max-[576px]:max-w-none"
                onClick={isEditing ? handleCancel : handleEdit}
              >
                {isEditing ? "Отмена" : "Редактировать"}
              </DesignButton>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
