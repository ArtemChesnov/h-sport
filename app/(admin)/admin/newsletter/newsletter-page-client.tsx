"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui";
import {
  useAdminNewsletterIssuesQuery,
  useAdminNewsletterSubscribersQuery,
  useCreateAdminNewsletterIssueMutation,
  useDeleteAdminNewsletterSubscriberMutation,
  useSendAdminNewsletterIssueMutation,
} from "@/shared/hooks";
import { getErrorMessage } from "@/shared/lib/errors";
import type {
  AdminNewsletterIssueDto,
  AdminSubscriberDto,
} from "@/shared/services";
import { Loader2, Newspaper, Send, UserMinus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PaginationControls } from "../components/common/pagination-controls";
import { NewsletterIssueFormDialog } from "./newsletter-issue-form-dialog";
import {
  NewsletterSubscribersFilters,
  type ConfirmedFilter,
} from "./newsletter-subscribers-filters";

const SOURCE_LABELS: Record<string, string> = {
  footer: "Подвал сайта",
  popup: "Всплывающее окно",
  checkout: "Оформление заказа",
};
function getSourceLabel(source: string | null): string {
  if (!source) return "—";
  return SOURCE_LABELS[source] ?? source;
}

export function NewsletterPageClient() {
  const [activeTab, setActiveTab] = useState<string>("subscribers");

  // Подписчики
  const [subPage, setSubPage] = useState(1);
  const [subEmail, setSubEmail] = useState("");
  const [subConfirmed, setSubConfirmed] = useState<ConfirmedFilter>("all");
  const subParams = useMemo(() => {
    const p: { page: number; perPage: number; email?: string; isConfirmed?: boolean } = {
      page: subPage,
      perPage: 20,
    };
    if (subEmail.trim()) p.email = subEmail.trim();
    if (subConfirmed === "confirmed") p.isConfirmed = true;
    if (subConfirmed === "pending") p.isConfirmed = false;
    return p;
  }, [subPage, subEmail, subConfirmed]);

  const subscribersQuery = useAdminNewsletterSubscribersQuery(subParams);
  const subItems = subscribersQuery.data?.items ?? [];
  const subMeta = subscribersQuery.data?.meta ?? { page: 1, perPage: 20, total: 0, pages: 1 };

  // Выпуски
  const [issuePage, setIssuePage] = useState(1);
  const issueParams = useMemo(() => ({ page: issuePage, perPage: 10 }), [issuePage]);
  const issuesQuery = useAdminNewsletterIssuesQuery(issueParams);
  const issueItems = issuesQuery.data?.items ?? [];
  const issueMeta = issuesQuery.data?.meta ?? { page: 1, perPage: 10, total: 0, pages: 1 };

  const createIssue = useCreateAdminNewsletterIssueMutation();
  const sendIssue = useSendAdminNewsletterIssueMutation();
  const deleteSubscriber = useDeleteAdminNewsletterSubscriberMutation();
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [unsubscribingId, setUnsubscribingId] = useState<number | null>(null);

  const handleCreateIssue = async (payload: { subject: string; bodyHtml: string }) => {
    return new Promise<void>((resolve, reject) => {
      createIssue.mutate(payload, {
        onSuccess: () => {
          toast.success("Рассылка создана");
          setIssueDialogOpen(false);
          resolve();
        },
        onError: (e) => {
          toast.error(getErrorMessage(e));
          reject(e);
        },
      });
    });
  };

  const handleUnsubscribe = (sub: AdminSubscriberDto) => {
    setUnsubscribingId(sub.id);
    deleteSubscriber.mutate(sub.id, {
      onSuccess: () => {
        setUnsubscribingId(null);
        toast.success("Подписчик отписан");
      },
      onError: (e) => {
        setUnsubscribingId(null);
        toast.error(getErrorMessage(e));
      },
    });
  };

  const handleSend = (issue: AdminNewsletterIssueDto) => {
    if (issue.sentAt) return;
    setSendingId(issue.id);
    sendIssue.mutate(issue.id, {
      onSuccess: (data) => {
        setSendingId(null);
        toast.success(`Отправлено: ${data.sentCount} подписчикам`);
      },
      onError: (e) => {
        setSendingId(null);
        toast.error(getErrorMessage(e));
      },
    });
  };

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Рассылки</h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Подписчики на новости и выпуски рассылки
          </p>
        </div>
      </header>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subscribers" className="gap-2">
            <Users className="h-4 w-4" />
            Подписчики
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Выпуски
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <NewsletterSubscribersFilters
            email={subEmail}
            confirmedFilter={subConfirmed}
            total={subMeta.total}
            onEmailChange={(v: string) => { setSubPage(1); setSubEmail(v); }}
            onConfirmedChange={(v: ConfirmedFilter) => { setSubPage(1); setSubConfirmed(v); }}
          />
          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-rose-50/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-rose-600" />
                <CardTitle className="text-base font-semibold">Список подписчиков</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Всего {subMeta.total} {subMeta.total === 1 ? "подписчик" : subMeta.total < 5 ? "подписчика" : "подписчиков"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {subscribersQuery.isLoading ? (
                <SubscribersTableSkeleton />
              ) : subItems.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Подписчиков пока нет</EmptyTitle>
                    <EmptyDescription>Они появятся после подписки на новости в магазине</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-border/50 bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 border-b border-border/50">
                          <TableHead className="font-semibold text-xs h-12">Email</TableHead>
                          <TableHead className="font-semibold text-xs h-12">Источник</TableHead>
                          <TableHead className="font-semibold text-xs h-12">Статус</TableHead>
                          <TableHead className="font-semibold text-xs h-12">Дата</TableHead>
                          <TableHead className="text-right font-semibold text-xs h-12">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subItems.map((row: AdminSubscriberDto) => (
                          <TableRow key={row.id} className="border-b border-border/30">
                            <TableCell className="font-medium text-sm">{row.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{getSourceLabel(row.source)}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  row.isConfirmed
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {row.isConfirmed ? "Подтверждён" : "Ожидает"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(row.createdAt).toLocaleDateString("ru-RU")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                disabled={unsubscribingId !== null}
                                onClick={() => handleUnsubscribe(row)}
                              >
                                {unsubscribingId === row.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserMinus className="h-4 w-4" />
                                )}
                                Отписать
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {subMeta.pages > 1 && (
                    <div className="mt-4">
                      <PaginationControls
                        currentPage={subMeta.page}
                        totalPages={subMeta.pages}
                        onPageChange={setSubPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setIssueDialogOpen(true)}
              className="h-9 gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Newspaper className="h-4 w-4" />
              Создать рассылку
            </Button>
          </div>
          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-rose-50/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Newspaper className="h-5 w-5 text-rose-600" />
                <CardTitle className="text-base font-semibold">Выпуски рассылки</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Всего {issueMeta.total} {issueMeta.total === 1 ? "выпуск" : issueMeta.total < 5 ? "выпуска" : "выпусков"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {issuesQuery.isLoading ? (
                <IssuesTableSkeleton />
              ) : issueItems.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Выпусков пока нет</EmptyTitle>
                    <EmptyDescription>Создайте рассылку и отправьте её подписчикам</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-border/50 bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 border-b border-border/50">
                          <TableHead className="font-semibold text-xs h-12">Тема</TableHead>
                          <TableHead className="font-semibold text-xs h-12">Создан</TableHead>
                          <TableHead className="font-semibold text-xs h-12">Отправлен</TableHead>
                          <TableHead className="text-right font-semibold text-xs h-12">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {issueItems.map((row: AdminNewsletterIssueDto) => (
                          <TableRow key={row.id} className="border-b border-border/30">
                            <TableCell className="font-medium text-sm max-w-[280px] truncate" title={row.subject}>
                              {row.subject}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(row.createdAt).toLocaleDateString("ru-RU")}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {row.sentAt
                                ? new Date(row.sentAt).toLocaleDateString("ru-RU")
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {!row.sentAt ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 gap-1.5"
                                  disabled={sendingId !== null}
                                  onClick={() => handleSend(row)}
                                >
                                  {sendingId === row.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                  Отправить
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">Отправлено</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {issueMeta.pages > 1 && (
                    <div className="mt-4">
                      <PaginationControls
                        currentPage={issueMeta.page}
                        totalPages={issueMeta.pages}
                        onPageChange={setIssuePage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewsletterIssueFormDialog
        open={issueDialogOpen}
        onOpenChange={setIssueDialogOpen}
        onSubmit={handleCreateIssue}
        isSubmitting={createIssue.isPending}
      />
    </div>
  );
}

function SubscribersTableSkeleton() {
  return (
    <div className="space-y-0 rounded-lg border border-border/50 bg-background">
      <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20 ml-auto" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24 ml-auto" />
        </div>
      ))}
    </div>
  );
}

function IssuesTableSkeleton() {
  return (
    <div className="space-y-0 rounded-lg border border-border/50 bg-background">
      <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24 ml-auto" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 ml-auto" />
        </div>
      ))}
    </div>
  );
}
