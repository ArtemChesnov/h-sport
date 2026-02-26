"use client";

import React from "react";
import { useUserProfileQuery } from "../user/user-profile.hooks";
import {
    CHECKOUT_ADDRESS_STORAGE_KEY,
    CheckoutAddressFormData,
    DEFAULT_CHECKOUT_ADDRESS_FORM,
    loadCheckoutAddressFromStorage,
    parseFullAddressLine,
    saveCheckoutAddressToStorage,
} from "./checkout.hooks";

/**
 * Контекст для синхронизации адреса checkout между компонентами.
 */
const CheckoutAddressContext = React.createContext<{
  address: CheckoutAddressFormData;
  setAddress: (patch: Partial<CheckoutAddressFormData>) => void;
} | null>(null);

/**
 * Провайдер контекста для адреса checkout.
 * Должен быть обернут вокруг компонентов checkout.
 */
export function CheckoutAddressProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddressState] = React.useState<CheckoutAddressFormData>(
    DEFAULT_CHECKOUT_ADDRESS_FORM
  );
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Используем useUserProfileQuery для подписки на изменения кэша
  // Благодаря staleTime: 5 минут и refetchOnMount: false, запрос НЕ будет
  // выполняться повторно, если данные уже есть в кэше
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfileQuery();

  // При монтировании подтягиваем данные. Профиль (ЛК) имеет приоритет — если пользователь всё заполнил в ЛК, подставляем именно эти данные.
  React.useEffect(() => {
    if (hasInitialized || isLoadingProfile) return;

    const stored = loadCheckoutAddressFromStorage();

    if (userProfile) {
      // Приоритет у данных из профиля (ЛК): email, phone, fullName, адрес
      const fullName =
        [userProfile.name, userProfile.secondName].filter(Boolean).join(" ").trim() || "";
      const profileAddress = userProfile.address;
      const parsed = parseFullAddressLine(profileAddress?.street || "");

      const initialAddress: CheckoutAddressFormData = {
        ...DEFAULT_CHECKOUT_ADDRESS_FORM,
        email: userProfile.email || "",
        phone: userProfile.phone ?? "",
        fullName,
        country: profileAddress?.country || "Россия",
        city: profileAddress?.city || "",
        street: parsed.street,
        house: parsed.house,
        entrance: parsed.entrance,
        apartment: parsed.apartment,
        pickupPoint: stored?.pickupPoint ?? "",
        deliveryMethod: stored?.deliveryMethod ?? "CDEK_COURIER",
      };

      setAddressState(initialAddress);
      saveCheckoutAddressToStorage(initialAddress);
    } else {
      const hasStored =
        stored && (stored.email || stored.fullName || stored.phone || stored.city);
      const base: CheckoutAddressFormData = hasStored
        ? { ...DEFAULT_CHECKOUT_ADDRESS_FORM, ...stored }
        : DEFAULT_CHECKOUT_ADDRESS_FORM;
      setAddressState(base);
      if (hasStored) saveCheckoutAddressToStorage(base);
    }

    setHasInitialized(true);
  }, [userProfile, hasInitialized, isLoadingProfile]);

  // Слушаем изменения в sessionStorage от других вкладок/окон
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CHECKOUT_ADDRESS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Partial<CheckoutAddressFormData>;
          if (parsed && typeof parsed === "object") {
            setAddressState((prev) => ({
              ...prev,
              ...parsed,
            }));
          }
        } catch {
          // игнорируем ошибки парсинга
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setAddress = React.useCallback((patch: Partial<CheckoutAddressFormData>) => {
    setAddressState((prev) => {
      const next: CheckoutAddressFormData = {
        ...prev,
        ...patch,
      };

      saveCheckoutAddressToStorage(next);

      // Триггерим кастомное событие для синхронизации в том же окне
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("checkout-address-changed", {
            detail: next,
          })
        );
      }

      return next;
    });
  }, []);

  // Слушаем кастомные события для синхронизации в том же окне
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCustomStorageChange = (e: CustomEvent<CheckoutAddressFormData>) => {
      setAddressState(e.detail);
    };

    window.addEventListener("checkout-address-changed", handleCustomStorageChange as EventListener);
    return () =>
      window.removeEventListener(
        "checkout-address-changed",
        handleCustomStorageChange as EventListener
      );
  }, []);

  return (
    <CheckoutAddressContext.Provider value={{ address, setAddress }}>
      {children}
    </CheckoutAddressContext.Provider>
  );
}

/**
 * Безопасная версия хука для доступа к контексту адреса checkout.
 * Возвращает null, если контекст недоступен (вместо throw).
 */
export function useCheckoutAddressContextSafe() {
  return React.useContext(CheckoutAddressContext);
}
