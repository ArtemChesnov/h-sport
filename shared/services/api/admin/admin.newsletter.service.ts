import { ApiRoutes, axiosInstance, buildAdminNewsletterIssueSendUrl, buildAdminNewsletterSubscriberUrl } from "../../http";
import { getApiErrorMessage } from "../api-errors";

export type AdminSubscriberDto = {
  id: number;
  email: string;
  source: string | null;
  isConfirmed: boolean;
  createdAt: string;
  confirmedAt: string | null;
};

export type AdminNewsletterIssueDto = {
  id: number;
  subject: string;
  bodyHtml: string;
  sentAt: string | null;
  createdAt: string;
};

export type AdminNewsletterSubscribersQueryDto = {
  page?: number;
  perPage?: number;
  email?: string;
  isConfirmed?: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: { page: number; perPage: number; total: number; pages: number; hasNext: boolean; hasPrev: boolean };
};

export async function fetchAdminNewsletterSubscribers(
  params: AdminNewsletterSubscribersQueryDto = {},
): Promise<PaginatedResponse<AdminSubscriberDto>> {
  try {
    const { data } = await axiosInstance.get<PaginatedResponse<AdminSubscriberDto>>(
      ApiRoutes.ADMIN_NEWSLETTER_SUBSCRIBERS,
      { params },
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить список подписчиков"),
    );
  }
}

export async function fetchAdminNewsletterIssues(params: {
  page?: number;
  perPage?: number;
} = {}): Promise<PaginatedResponse<AdminNewsletterIssueDto>> {
  try {
    const { data } = await axiosInstance.get<PaginatedResponse<AdminNewsletterIssueDto>>(
      ApiRoutes.ADMIN_NEWSLETTER_ISSUES,
      { params },
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить список рассылок"),
    );
  }
}

export async function createAdminNewsletterIssue(payload: {
  subject: string;
  bodyHtml: string;
}): Promise<AdminNewsletterIssueDto> {
  try {
    const { data } = await axiosInstance.post<AdminNewsletterIssueDto>(
      ApiRoutes.ADMIN_NEWSLETTER_ISSUES,
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось создать рассылку"));
  }
}

export async function sendAdminNewsletterIssue(id: number): Promise<{ success: boolean; sentCount: number }> {
  try {
    const { data } = await axiosInstance.post<{ success: boolean; sentCount: number }>(
      buildAdminNewsletterIssueSendUrl(id),
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось отправить рассылку"));
  }
}

export async function deleteAdminNewsletterSubscriber(id: number): Promise<void> {
  try {
    await axiosInstance.delete(buildAdminNewsletterSubscriberUrl(id));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Не удалось отписать"));
  }
}
