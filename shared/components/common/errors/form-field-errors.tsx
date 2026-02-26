"use client";

import { cn } from "@/shared/lib";


type FormFieldErrorProps = {
  /**
   * Имя поля, по которому ищем ошибку в errors.
   *
   * Например:
   *   name="name"
   *   name="slug"
   *   name="size"
   */
  name?: string;

  /**
   * Объект ошибок:
   *
   * - для плоских форм: FormErrorsRecord;
   * - для nested-ветки: Record<string, string> для items[index].
   */
  errors?: Record<string, string> | undefined;

  /**
   * Явное сообщение об ошибке.
   * Если передано — имеет приоритет над errors[name].
   */
  message?: string;

  className?: string;
};

/**
 * Универсальный компонент для вывода ошибок поля формы.
 *
 * Работает и с плоскими errors (FormErrorsRecord),
 * и с branch ошибок в nested-форме (errorsTree.items[index]).
 *
 * Примеры:
 *
 *   <FormFieldError name="name" errors={formErrors} />
 *   <FormFieldError name="_global" errors={formErrors} />
 *
 *   const itemErrors = (errorsTree.items as any)?.[index] as Record<string, string> | undefined;
 *   <FormFieldError name="size" errors={itemErrors} />
 */
export function FormFieldError(props: FormFieldErrorProps) {
  const { name, errors, message, className } = props;

  const text = message ?? (name && errors && Object.prototype.hasOwnProperty.call(errors, name) ? errors[name] : undefined);

  if (!text) {
    return null;
  }

  return <p className={cn("mt-1 text-xs text-destructive whitespace-pre-line", className)}>{text}</p>;
}

/**
 * Унифицированный компонент для отображения ошибок валидации обязательных полей
 * Используется для валидации форм (например, в чекауте)
 */
export function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return <p className={cn("mt-1 text-xs text-destructive", className)}>{message}</p>;
}
