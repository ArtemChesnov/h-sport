"use client";

import { FieldError } from "@/shared/components/common";
import { DatePicker, DesignButton, Spinner } from "@/shared/components/ui";
import { INPUT_FIELD_CLASS, INPUT_LABEL_CLASS, TOAST } from "@/shared/constants";
import { formatBirthDateDisplay } from "@/shared/lib/formatters";
import { isValidBirthDate, isValidEmail, isValidPhone } from "@/shared/lib/validation";
import React from "react";
import { toast } from "sonner";
import type { PersonalFormData, PersonalFormErrors } from "../lib/profile-form-utils";

type PersonalInfoFormProps = {
  initialData: PersonalFormData;
  onSave: (data: {
    name: string | null;
    secondName: string | null;
    phone: string | null;
    email: string;
    birthDate: string | null;
  }) => Promise<void>;
  onReset: () => PersonalFormData;
};

export function PersonalInfoForm({ initialData, onSave, onReset }: PersonalInfoFormProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [form, setForm] = React.useState<PersonalFormData>(initialData);
  const [errors, setErrors] = React.useState<PersonalFormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = React.useCallback(
    <K extends keyof PersonalFormData>(field: K, value: PersonalFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

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
    const nextErrors: PersonalFormErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "ФИО обязательно для заполнения";
    if (!form.email.trim()) {
      nextErrors.email = "E-mail обязателен для заполнения";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "Некорректный формат e-mail";
    }
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      nextErrors.phone = "Некорректный формат телефона";
    }
    if (form.birthDate && !isValidBirthDate(form.birthDate)) {
      nextErrors.birthDate = "Некорректная дата рождения";
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
        const nameParts = form.fullName.trim().split(/\s+/);
        const name = nameParts[0] || null;
        const secondName = nameParts.slice(1).join(" ") || null;

        await onSave({
          name,
          secondName,
          phone: form.phone.trim() || null,
          email: form.email.trim(),
          birthDate: form.birthDate || null,
        });
        toast.success(TOAST.SUCCESS.PROFILE_SAVED);
        setIsEditing(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Попробуйте позже";
        if (message.toLowerCase().includes("email") || message.toLowerCase().includes("e-mail")) {
          setErrors((prev) => ({ ...prev, email: message }));
        } else {
          toast.error(TOAST.ERROR.FAILED_TO_SAVE_PROFILE, { description: message });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isSubmitting, onSave, validate]
  );

  return (
    <form id="personal-form" onSubmit={handleSubmit} noValidate>
      <h1 className="text-[22px] leading-[100%] font-semibold max-[576px]:text-[22px] min-[873px]:text-[32px] min-[1024px]:text-[38px]">
        Персональная информация
      </h1>

      <div className="w-full h-0.75 bg-primary my-4 min-[873px]:my-6 min-[1024px]:my-8" />

      <div className="flex justify-between max-[1440px]:gap-8 max-[1024px]:flex-col max-[1090px]:gap-6">
        <p className="leading-[130%] font-normal text-[14px] text-muted-foreground max-w-78.25 max-[1900px]:max-w-62.25 min-[1024px]:text-[16px] max-[1090px]:max-w-full">
          Сохранённые данные помогут Вам оформлять покупки быстрее
          <br className="max-[576px]:hidden" />и удобнее в будущем
        </p>

        <div className="flex flex-col items-start max-[576px]:items-stretch max-[1090px]:ml-0 max-[1440px]:ml-auto ml-33 w-full">
          <div className="flex flex-wrap gap-4 w-full max-[576px]:flex-col max-[576px]:gap-4 min-[873px]:gap-5">
            <div className="flex flex-col gap-3 min-w-53.75 min-[576px]:flex-1 max-[576px]:w-full min-[873px]:gap-4">
              <label className="space-y-2">
                <span className={INPUT_LABEL_CLASS}>ФИО</span>
                <input
                  type="text"
                  disabled={!isEditing}
                  aria-invalid={!!errors.fullName}
                  className={INPUT_FIELD_CLASS}
                  placeholder="Иванова Анна"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                <FieldError message={errors.fullName} />
              </label>

              <div className="space-y-2">
                <span className={INPUT_LABEL_CLASS}>Дата рождения</span>
                <DatePicker
                  id="personal-birth-date"
                  value={form.birthDate}
                  onChange={(val) => handleChange("birthDate", val)}
                  disabled={!isEditing}
                  maxDate={new Date()}
                  placeholder="21 января 1995 г."
                  displayFormat={formatBirthDateDisplay}
                  className="w-full min-w-[215px]"
                  error={!!errors.birthDate}
                />
                <FieldError message={errors.birthDate} />
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-53.75 min-[576px]:flex-1 max-[576px]:w-full min-[873px]:gap-4">
              <label className="space-y-2">
                <span className={INPUT_LABEL_CLASS}>Телефон</span>
                <input
                  type="tel"
                  disabled={!isEditing}
                  aria-invalid={!!errors.phone}
                  className={INPUT_FIELD_CLASS}
                  placeholder="+7 (___) ___ __ __"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <FieldError message={errors.phone} />
              </label>

              <label className="space-y-2">
                <span className={INPUT_LABEL_CLASS}>EMAIL</span>
                <input
                  type="email"
                  disabled={!isEditing}
                  aria-invalid={!!errors.email}
                  className={INPUT_FIELD_CLASS}
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <FieldError message={errors.email} />
              </label>
            </div>
          </div>

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
