import type {AxiosError} from "axios";

/**
 * Аккуратно достаёт человекочитаемый message из ошибки API (AxiosError),
 * если он есть, иначе возвращает fallback.
 */
export function getApiErrorMessage(
    error: unknown,
    fallback: string,
): string {
    const axiosError = error as AxiosError<{ message?: string } | undefined>;

    const apiMessage = axiosError.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
        return apiMessage;
    }

    if (axiosError.message.trim().length > 0) {
        return axiosError.message;
    }

    return fallback;
}
