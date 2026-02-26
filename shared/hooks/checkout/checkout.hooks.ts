"use client";

import type { CheckoutAddressFormData, CheckoutDeliveryMethod } from "@/shared/services/dto";
import React from "react";
import { useCheckoutAddressContextSafe } from "./checkout-address-provider";

export type { CheckoutAddressFormData, CheckoutDeliveryMethod } from "@/shared/services/dto";

/** sessionStorage key черновика адреса checkout. */
export const CHECKOUT_ADDRESS_STORAGE_KEY = "checkout_address_v1";

/** Строка адреса "ул. X, д. Y, подъезд Z, кв. W". Только street → как есть. */
export function buildFullAddressLine(data: {
    street: string;
    house: string;
    entrance: string;
    apartment: string;
}): string {
    const { street, house, entrance, apartment } = data;
    const hasParts = house.trim() || entrance.trim() || apartment.trim();
    if (!hasParts) return street.trim();
    const parts: string[] = [];
    if (street.trim()) parts.push(`ул. ${street.trim()}`);
    if (house.trim()) parts.push(`д. ${house.trim()}`);
    if (entrance.trim()) parts.push(`подъезд ${entrance.trim()}`);
    if (apartment.trim()) parts.push(`кв. ${apartment.trim()}`);
    return parts.join(", ");
}

/** Парсит строку адреса в поля street, house, entrance, apartment. */
export function parseFullAddressLine(streetLine: string): {
    street: string;
    house: string;
    entrance: string;
    apartment: string;
} {
    const trimmed = (streetLine || "").trim();
    if (!trimmed) return { street: "", house: "", entrance: "", apartment: "" };

    if (trimmed.includes("ул.") || trimmed.includes("д.") || trimmed.includes("кв.")) {
        const parts = trimmed.split(",").map((p) => p.trim());
        let street = "";
        let house = "";
        let entrance = "";
        let apartment = "";
        for (const p of parts) {
            if (p.startsWith("ул.")) street = p.replace(/^ул\.\s*/, "").trim();
            else if (p.startsWith("д.")) house = p.replace(/^д\.\s*/, "").trim();
            else if (p.toLowerCase().startsWith("подъезд"))
                entrance = p.replace(/^подъезд\s*/i, "").trim();
            else if (p.startsWith("кв.")) apartment = p.replace(/^кв\.\s*/, "").trim();
        }
        return { street, house, entrance, apartment };
    }

    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    return {
        street: parts[0] || "",
        house: parts[1] || "",
        entrance: "",
        apartment: parts[2] || "",
    };
}

/** Дефолт формы checkout (без window/storage). */
export const DEFAULT_CHECKOUT_ADDRESS_FORM: CheckoutAddressFormData = {
    email: "",
    phone: "",
    fullName: "",

    country: "",
    city: "",
    street: "",
    house: "",
    entrance: "",
    apartment: "",

    pickupPoint: "",

    // Базовый дефолт — курьер СДЭК
    deliveryMethod: "CDEK_COURIER",
};

/**
 * Безопасное чтение формы из sessionStorage.
 * На сервере просто возвращает null.
 */
export function loadCheckoutAddressFromStorage(): CheckoutAddressFormData | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.sessionStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<CheckoutAddressFormData> | null;
        if (!parsed || typeof parsed !== "object") return null;

        return {
            ...DEFAULT_CHECKOUT_ADDRESS_FORM,
            ...parsed,
            house: parsed.house ?? DEFAULT_CHECKOUT_ADDRESS_FORM.house,
            entrance: parsed.entrance ?? DEFAULT_CHECKOUT_ADDRESS_FORM.entrance,
        };
    } catch {
        return null;
    }
}

/**
 * Сохранение формы в sessionStorage.
 */
export function saveCheckoutAddressToStorage(data: CheckoutAddressFormData) {
    if (typeof window === "undefined") return;

    try {
        window.sessionStorage.setItem(
            CHECKOUT_ADDRESS_STORAGE_KEY,
            JSON.stringify(data),
        );
    } catch {
        // молча игнорим, если storage недоступен
    }
}


/**
 * Хук для работы с адресом checkout.
 *
 * Гарантирует:
 *  - детерминированный initial state для SSR;
 *  - загрузку сохранённого черновика только на клиенте;
 *  - удобный setAddress(patch) c автосохранением в storage;
 *  - синхронизацию между компонентами через контекст.
 *
 * ВАЖНО: Для синхронизации между компонентами должен использоваться внутри CheckoutAddressProvider.
 * Если провайдер не обернут, работает в режиме fallback с локальным состоянием.
 */
export function useCheckoutAddress() {
    // Всегда вызываем хуки в одном порядке
        const [address, setAddressState] = React.useState<CheckoutAddressFormData>(
            DEFAULT_CHECKOUT_ADDRESS_FORM,
        );

    // Пытаемся использовать контекст из провайдера (безопасная версия)
    const contextValue = useCheckoutAddressContextSafe();

    // Всегда вызываем useEffect и useCallback, даже если контекст доступен
    // Это необходимо для соблюдения правил хуков
        React.useEffect(() => {
        // Если контекст доступен, не загружаем из storage
        if (contextValue) {
            return;
        }
            const stored = loadCheckoutAddressFromStorage();
            if (stored) {
                setAddressState(stored);
            }
    }, [contextValue]);

        const setAddress = React.useCallback(
            (patch: Partial<CheckoutAddressFormData>) => {
            // Если контекст доступен, используем его setAddress
            if (contextValue) {
                contextValue.setAddress(patch);
                return;
            }
            // Fallback: используем локальное состояние
                setAddressState((prev) => {
                    const next: CheckoutAddressFormData = {
                        ...prev,
                        ...patch,
                    };

                    saveCheckoutAddressToStorage(next);
                    return next;
                });
            },
        [contextValue],
        );

    // Если контекст доступен, используем его значения
    if (contextValue) {
        return contextValue;
    }

    // Fallback: возвращаем локальное состояние
    return { address, setAddress };
}

/**
 * Человеческий лейбл для способа доставки.
 * Можно допиливать под реальные тексты на сайте.
 */
export function getCheckoutDeliveryMethodLabel(
    method: CheckoutDeliveryMethod,
): string {
    switch (method) {
        case "CDEK_COURIER":
            return "СДЭК — курьер";
        case "CDEK_PVZ":
            return "СДЭК — пункт выдачи";
        case "POCHTA_COURIER":
            return "Почта России — курьер";
        case "POCHTA_PVZ":
            return "Почта России — отделение";
        case "PICKUP_SHOWROOM":
            return "Самовывоз из шоурума";
        default:
            return method;
    }
}
