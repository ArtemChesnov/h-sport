/**
 * Одна ошибка, как её отдаёт бэкенд.
 *
 * Пример:
 *   { field: "name", message: "Название обязательно" }
 *   { field: "items[0].size", message: "Размер обязателен" }
 *   { field: "_global", message: "Что-то пошло не так" }
 */
export type FieldError = {
  field: string;
  message: string;
};

/**
 * Плоское представление ошибок формы:
 *
 *   {
 *     name: "Название обязательно",
 *     slug: "Slug занят",
 *     _global: "Что-то пошло не так"
 *   }
 *
 * Удобно для простых форм, где name инпута = ключу в объекте.
 */
export type FormErrorsRecord = Record<string, string>;

/**
 * Nested-представление ошибок:
 *
 *   {
 *     name: "Название обязательно",
 *     items: [
 *       { size: "Обязательное поле", price: "Слишком дорого" },
 *       { size: "Недопустимый размер" }
 *     ],
 *     _global: "Ошибка сохранения"
 *   }
 *
 * Используется, когда нужны ошибки по элементам массивов
 * (items[0].size → errors.items[0].size).
 */
export type NestedFormErrors = Record<string, unknown>;

/**
 * Парсит путь вида:
 *   "items[0].size" → ["items", 0, "size"]
 *   "name"          → ["name"]
 */
function parseFieldPath(field: string): Array<string | number> {
  const path: Array<string | number> = [];
  const regex = /([^[.\]]+)|\[(\d+)\]/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(field))) {
    if (match[1] !== undefined) {
      path.push(match[1]);
    } else if (match[2] !== undefined) {
      path.push(Number(match[2]));
    }
  }

  return path;
}

/**
 * Вставляет message в target по пути path.
 *
 * Пример:
 *   setNestedError(result, ["items", 0, "size"], "Ошибка")
 *   → result.items[0].size = "Ошибка"
 *
 * Если по тому же пути уже есть строка — ошибки склеиваются через \n.
 */
function setNestedError(
    target: NestedFormErrors,
    path: Array<string | number>,
    message: string,
): void {
  let current: Record<string | number, unknown> | unknown[] = target;

  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index];
    const isLast = index === path.length - 1;

    if (isLast) {
      if (Array.isArray(current)) {
        const prev = current[segment as number];

        if (typeof prev === "string" && prev.length > 0) {
          current[segment as number] = `${prev}\n${message}`;
        } else {
          current[segment as number] = message;
        }
      } else {
        const obj = current as Record<string | number, unknown>;
        const prev = obj[segment];

        if (typeof prev === "string" && prev.length > 0) {
          obj[segment] = `${prev}\n${message}`;
        } else {
          obj[segment] = message;
        }
      }

      return;
    }

    const nextSegment = path[index + 1];

    if (Array.isArray(current)) {
      const arr = current as unknown[];

      const idx = segment as number;
      if (arr[idx] == null) {
        arr[idx] =
            typeof nextSegment === "number"
                ? []
                : ({} as NestedFormErrors);
      }

      current = arr[idx] as
          | Record<string | number, unknown>
          | unknown[];
    } else {
      const obj = current as Record<string | number, unknown>;
      const key = segment as string;

      if (obj[key] == null) {
        obj[key] =
            typeof nextSegment === "number"
                ? []
                : ({} as NestedFormErrors);
      }

      current = obj[key] as
          | Record<string | number, unknown>
          | unknown[];
    }
  }
}

/**
 * Превращает FieldError[] в плоский объект вида:
 *
 *   {
 *     name: "Название обязательно",
 *     slug: "Slug занят",
 *     _global: "Что-то пошло не так"
 *   }
 *
 * Назначение:
 *  - для простых форм;
 *  - для useServerFormErrors();
 *  - когда хочешь просто errors[fieldName].
 *
 * Особенности:
 *  - field === "_global" → кладём в ключ "_global";
 *  - несколько ошибок по одному полю склеиваются через \n.
 */
export function mapFieldErrorsToForm(
    errors?: FieldError[] | null,
): FormErrorsRecord {
  const result: FormErrorsRecord = {};

  if (!errors || errors.length === 0) {
    return result;
  }

  for (const error of errors) {
    const fieldKey = error.field || "_global";

    if (!result[fieldKey]) {
      result[fieldKey] = error.message;
    } else {
      result[fieldKey] = `${result[fieldKey]}\n${error.message}`;
    }
  }

  return result;
}

/**
 * Превращает FieldError[] в дерево NestedFormErrors.
 *
 * Примеры:
 *   "name"           → result.name
 *   "slug"           → result.slug
 *   "items[0].size"  → result.items[0].size
 *   "items[1].price" → result.items[1].price
 *
 * "_global" используется для общих ошибок формы, которые не
 * привязаны к конкретному полю.
 *
 * Удобно:
 *  - для форм с массивами (items[]);
 *  - когда каждый элемент массива — отдельный компонент.
 */
export function mapFieldErrorsToNestedFormErrors(
    errors?: FieldError[] | null,
): NestedFormErrors {
  const result: NestedFormErrors = {};

  if (!errors || errors.length === 0) {
    return result;
  }

  for (const error of errors) {
    const fieldName =
        error.field && error.field.trim().length > 0
            ? error.field
            : "_global";

    if (fieldName === "_global") {
      const prev = result._global as string | undefined;

      if (typeof prev === "string" && prev.length > 0) {
        (result as Record<string, unknown>)._global = `${prev}\n${error.message}`;
      } else {
        (result as Record<string, unknown>)._global = error.message;
      }

      continue;
    }

    const path = parseFieldPath(fieldName);
    setNestedError(result, path, error.message);
  }

  return result;
}
