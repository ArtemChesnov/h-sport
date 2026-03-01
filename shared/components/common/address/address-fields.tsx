"use client";

import type { CitySuggestion } from "@/modules/shipping/lib/geocoding/types";
import { CityAutocomplete, CountryAutocomplete, FieldError } from "@/shared/components/common";
import { INPUT_FIELD_CLASS, INPUT_LABEL_CLASS } from "@/shared/constants";

export type AddressFieldsData = {
  country: string;
  city: string;
  street: string;
  house: string;
  entrance: string;
  apartment: string;
};

export type AddressFieldsErrors = Partial<{
  country: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
}>;

interface AddressFieldsProps {
  values: AddressFieldsData;
  onChange: (patch: Partial<AddressFieldsData>) => void;
  errors?: AddressFieldsErrors;
  disabled?: boolean;
  onCitySelect?: (suggestion: CitySuggestion) => void;
  /** Показывать блок улицы, дома, подъезда, квартиры. По умолчанию true. */
  showStreetBlock?: boolean;
  /** Показывать звёздочки (*) у обязательных полей. В ЛК — false, в checkout — true. */
  showRequiredAsterisk?: boolean;
}

/**
 * Поля адреса: Страна, Город, Улица, Дом, Подъезд, Квартира.
 * Унифицированная структура для checkout и ЛК.
 */
function RequiredMark({ show }: { show: boolean }) {
  return show ? <span className="text-destructive"> *</span> : null;
}

export function AddressFields({
  values,
  onChange,
  errors,
  disabled = false,
  onCitySelect,
  showStreetBlock = true,
  showRequiredAsterisk = true,
}: AddressFieldsProps) {
  const req = <RequiredMark show={showRequiredAsterisk} />;

  // При 1090px и ниже: Страна, Город, Улица — столбик на всю ширину; Дом, Подъезд, Квартира — в одну строку втроём.
  const blockCountry = (
    <label
      key="country"
      className="w-full flex flex-col gap-2 order-1 min-[1091px]:row-start-1 min-[1091px]:col-start-1"
    >
      <span className={INPUT_LABEL_CLASS}>Страна{req}</span>
      <CountryAutocomplete
        value={values.country}
        onChange={(value) => onChange({ country: value })}
        disabled={disabled}
      />
      <FieldError message={errors?.country} />
    </label>
  );

  // Город показываем всегда (нужен и для курьера, и для ПВЗ — по городу запрашиваются пункты выдачи)
  const blockCity = (
    <label
      key="city"
      className="w-full flex flex-col gap-2 order-2 min-[1091px]:row-start-1 min-[1091px]:col-start-2"
    >
      <span className={INPUT_LABEL_CLASS}>Город{req}</span>
      <CityAutocomplete
        value={values.city}
        onChange={(value) => onChange({ city: value })}
        onSelect={(suggestion) => {
          if (suggestion.country && !values.country) {
            onChange({ country: suggestion.country });
          }
          onCitySelect?.(suggestion);
        }}
        disabled={disabled}
      />
      <FieldError message={errors?.city} />
    </label>
  );

  // Улица только для курьерской доставки; при ПВЗ (СДЭК, Почта России) не показываем
  const blockStreet = showStreetBlock ? (
    <label
      key="street"
      className="w-full flex flex-col gap-2 order-3 min-[1091px]:row-start-2 min-[1091px]:col-start-1"
    >
      <span className={INPUT_LABEL_CLASS}>Улица{req}</span>
      <input
        type="text"
        required
        placeholder="Улица"
        className={INPUT_FIELD_CLASS}
        value={values.street}
        onChange={(e) => onChange({ street: e.target.value })}
        disabled={disabled}
      />
      <FieldError message={errors?.street} />
    </label>
  ) : null;

  const blockHouseRow = showStreetBlock ? (
    <div
      key="houseRow"
      className="w-full flex flex-col gap-4 order-4 min-[1091px]:row-start-2 min-[1091px]:col-start-2"
    >
      <div className="flex gap-5">
        <label className="w-full flex flex-col gap-2">
          <span className={INPUT_LABEL_CLASS}>Дом{req}</span>
          <input
            type="text"
            required
            placeholder="Дом"
            className={INPUT_FIELD_CLASS}
            value={values.house}
            onChange={(e) => onChange({ house: e.target.value })}
            disabled={disabled}
          />
          <FieldError message={errors?.house} />
        </label>
        <label className="w-full flex flex-col gap-2">
          <span className={INPUT_LABEL_CLASS}>Подъезд</span>
          <input
            type="text"
            placeholder="Подъезд"
            className={INPUT_FIELD_CLASS}
            value={values.entrance}
            onChange={(e) => onChange({ entrance: e.target.value })}
            disabled={disabled}
          />
        </label>
        <label className="w-full flex flex-col gap-2">
          <span className={INPUT_LABEL_CLASS}>Квартира{req}</span>
          <input
            type="text"
            required
            placeholder="Квартира"
            className={INPUT_FIELD_CLASS}
            value={values.apartment}
            onChange={(e) => onChange({ apartment: e.target.value })}
            disabled={disabled}
          />
          <FieldError message={errors?.apartment} />
        </label>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-3 w-full max-[576px]:gap-3 min-[768px]:gap-4 min-[1091px]:grid min-[1091px]:grid-cols-2 min-[1091px]:gap-5 min-[1091px]:items-start">
      {blockCountry}
      {blockCity}
      {blockStreet}
      {blockHouseRow}
    </div>
  );
}
