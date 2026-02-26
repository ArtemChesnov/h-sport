/**
 * Сообщения валидации форм (чекaут, авторизация, профиль).
 * Используются в UI и при необходимости в API/сервисах.
 */

/** Сообщения для полей чекаута (адрес и контакты) */
export const CHECKOUT_VALIDATION = {
  email: {
    required: "E-mail обязателен для заполнения",
    invalid: "Некорректный формат e-mail",
  },
  phone: {
    required: "Телефон обязателен для заполнения",
  },
  fullName: {
    required: "ФИО обязательно для заполнения",
  },
  country: {
    required: "Страна обязательна для заполнения",
  },
  city: {
    required: "Город обязателен для заполнения",
  },
  street: {
    required: "Улица обязательна для заполнения",
  },
  house: {
    required: "Дом обязателен для заполнения",
  },
  apartment: {
    required: "Квартира обязательна для заполнения",
  },
  pickupPoint: {
    required: "Выберите пункт выдачи",
  },
} as const;

export const AUTH_VALIDATION = {
  name: {
    required: "Имя обязательно",
  },
  email: {
    required: "Email обязателен",
    invalid: "Некорректный email",
  },
  password: {
    required: "Пароль обязателен",
    minLength: "Пароль должен содержать минимум 8 символов",
  },
  confirmPassword: {
    required: "Подтверждение пароля обязательно",
    mismatch: "Пароли не совпадают",
  },
  agree: {
    required: "Необходимо согласиться с условиями",
  },
} as const;
