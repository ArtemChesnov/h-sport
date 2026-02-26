import { parseFullAddressLine } from "@/shared/hooks/checkout/checkout.hooks";
import type { DTO } from "@/shared/services";
import type {
    AddressFormData,
    PersonalFormData,
} from "@/shared/services/dto";

export type { AddressFormData, AddressFormErrors, PersonalFormData, PersonalFormErrors } from "@/shared/services/dto";

export function profileToPersonalForm(profile: DTO.UserProfileDto): PersonalFormData {
  const fullName =
    [profile.name, profile.secondName].filter((p): p is string => Boolean(p)).join(" ") || "";

  return {
    fullName,
    birthDate: profile.birthDate || "",
    phone: profile.phone || "",
    email: profile.email,
  };
}

export function profileToAddressForm(profile: DTO.UserProfileDto): AddressFormData {
  const address = profile.address;
  const parsed = parseFullAddressLine(address?.street || "");

  return {
    country: address?.country || "Россия",
    city: address?.city || "",
    street: parsed.street,
    house: parsed.house,
    entrance: parsed.entrance,
    apartment: parsed.apartment,
  };
}
