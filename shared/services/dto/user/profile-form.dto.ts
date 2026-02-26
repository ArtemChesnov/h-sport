/**
 * Типы форм профиля и адреса (ЛК, checkout).
 * Используются в account (personal-info-form, address-form) и при маппинге DTO.
 */

/** Форма персональной информации (имя, дата рождения, телефон, email) */
export type PersonalFormData = {
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
};

/** Форма адреса (страна, город, улица, дом, подъезд, квартира) */
export type AddressFormData = {
  country: string;
  city: string;
  street: string;
  house: string;
  entrance: string;
  apartment: string;
};

export type PersonalFormErrors = Partial<Record<keyof PersonalFormData, string>>;
export type AddressFormErrors = Partial<Record<keyof AddressFormData, string>>;
