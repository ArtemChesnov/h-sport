/**
 * DTO для получения профиля пользователя.
 */
export type UserProfileDto = {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  secondName: string | null;
  /** Дата рождения в формате ISO (YYYY-MM-DD) или null */
  birthDate: string | null;
  role: "USER" | "ADMIN";

  // Адрес (из первого адреса пользователя или null)
  address: {
    country: string | null;
    city: string; // обязательное поле в схеме
    street: string; // обязательное поле в схеме
    zip: string | null;
  } | null | undefined;
};

/**
 * DTO для обновления профиля пользователя.
 * Поддерживает частичное обновление: можно передать только изменённые поля.
 */
export type UserProfileUpdateDto = {
  phone?: string | null;
  name?: string | null;
  secondName?: string | null;
  email?: string;
  /** Дата рождения в формате ISO (YYYY-MM-DD) или null для очистки */
  birthDate?: string | null;

  // Адрес
  address?: {
    country?: string | null;
    city?: string; // обязательное поле в схеме, но опционально при обновлении
    street?: string; // обязательное поле в схеме, но опционально при обновлении
    zip?: string | null;
  } | null;
};

