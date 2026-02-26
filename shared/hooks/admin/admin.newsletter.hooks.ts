"use client";

import type { AdminNewsletterSubscribersQueryDto } from "@/shared/services";
import {
    createAdminNewsletterIssue,
    deleteAdminNewsletterSubscriber,
    fetchAdminNewsletterIssues,
    fetchAdminNewsletterSubscribers,
    sendAdminNewsletterIssue,
} from "@/shared/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const keys = {
  subscribers: (stable: string) => ["(admin)-newsletter-subscribers", stable] as const,
  issues: (stable: string) => ["(admin)-newsletter-issues", stable] as const,
};

function stableKey(params: unknown): string {
  return JSON.stringify(params ?? {});
}

export function useAdminNewsletterSubscribersQuery(
  params: AdminNewsletterSubscribersQueryDto = {},
) {
  const stable = stableKey(params);
  return useQuery({
    queryKey: keys.subscribers(stable),
    queryFn: () => fetchAdminNewsletterSubscribers(params),
  });
}

export function useAdminNewsletterIssuesQuery(params: { page?: number; perPage?: number } = {}) {
  const stable = stableKey(params);
  return useQuery({
    queryKey: keys.issues(stable),
    queryFn: () => fetchAdminNewsletterIssues(params),
  });
}

export function useCreateAdminNewsletterIssueMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { subject: string; bodyHtml: string }) =>
      createAdminNewsletterIssue(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["(admin)-newsletter-issues"] });
    },
  });
}

export function useSendAdminNewsletterIssueMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendAdminNewsletterIssue(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["(admin)-newsletter-issues"] });
    },
  });
}

export function useDeleteAdminNewsletterSubscriberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminNewsletterSubscriber(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["(admin)-newsletter-subscribers"] });
    },
  });
}
