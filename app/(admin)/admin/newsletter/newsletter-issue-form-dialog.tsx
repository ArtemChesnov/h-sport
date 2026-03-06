"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from "@/shared/components/ui";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  buildNewsletterBodyHtml,
  getNewsletterTemplateById,
  NEWSLETTER_TEMPLATES,
  plainTextToHtml,
  type NewsletterTemplateId,
} from "@/shared/constants";
import { getCsrfToken } from "@/shared/lib/csrf-client";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type NewsletterIssueFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { subject: string; bodyHtml: string }) => Promise<void>;
  isSubmitting: boolean;
};

const UPLOAD_FOLDER = "newsletter";

/** Собирает HTML контента: текст (как абзацы) + загруженные фото в конце */
function buildContentHtml(plainText: string, imageUrls: string[]): string {
  const textHtml = plainTextToHtml(plainText.trim());
  const imgTags = imageUrls.map(
    (url) =>
      `<img src="${url}" alt="" style="max-width:100%; height:auto; display:block; margin:12px 0;" />`
  );
  return [textHtml, ...imgTags].filter(Boolean).join("\n");
}

/**
 * HTML для предпросмотра: подставляем заглушку вместо ссылки отписки.
 */
function previewHtml(fullHtml: string): string {
  return fullHtml.replace(/\{\{unsubscribe_link\}\}/g, "#").replace(/\{\{shop_url\}\}/g, "#");
}

/**
 * Диалог создания выпуска рассылки: шаблон, тема, обычный текст, загрузка фото (автоматически в письме), предпросмотр.
 */
export function NewsletterIssueFormDialog(props: NewsletterIssueFormDialogProps) {
  const { open, onOpenChange, onSubmit, isSubmitting } = props;
  const [templateId, setTemplateId] = useState<NewsletterTemplateId>("simple");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next && !isSubmitting) {
      setTemplateId("simple");
      setSubject("");
      setBodyText("");
      setUploadedUrls([]);
    }
    onOpenChange(next);
  };

  const contentHtml = buildContentHtml(bodyText, uploadedUrls);
  const fullBodyHtml = buildNewsletterBodyHtml(templateId, contentHtml);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subject.trim();
    if (!sub) return;
    try {
      await onSubmit({ subject: sub, bodyHtml: fullBodyHtml });
      setTemplateId("simple");
      setSubject("");
      setBodyText("");
      setUploadedUrls([]);
    } catch {
      // Ошибка обрабатывается в вызывающем коде (toast.error в page-client)
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("folder", UPLOAD_FOLDER);

    const csrfToken = getCsrfToken();
    setIsUploading(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        toast.error(data?.message || "Ошибка загрузки");
        return;
      }

      const data = (await res.json()) as { paths: string[] };
      setUploadedUrls((prev) => [...prev, ...data.paths]);
      toast.success(`Загружено: ${data.paths.length} файл(ов). Они будут в конце письма.`);
    } catch {
      toast.error("Не удалось загрузить файлы");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const template = getNewsletterTemplateById(templateId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] rounded-2xl border shadow-lg max-h-[90vh] overflow-y-auto md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Создать рассылку</DialogTitle>
          <DialogDescription>
            Выберите шаблон, укажите тему и текст письма обычным языком. Загруженные фото
            автоматически добавятся в конец письма. Ссылка отписки подставится при отправке.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="newsletter-template">Шаблон письма</Label>
            <Select
              value={templateId}
              onValueChange={(v) => setTemplateId(v as NewsletterTemplateId)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="newsletter-template" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEWSLETTER_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newsletter-subject">Тема письма</Label>
            <Input
              id="newsletter-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Новости магазина — скидки и новинки"
              className="h-9"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newsletter-body">Текст письма</Label>
            <Textarea
              id="newsletter-body"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Здравствуйте! Ваш текст и новости. Пустая строка — новый абзац."
              className="min-h-[140px] text-sm resize-y"
              disabled={isSubmitting}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Пишите обычным текстом. Пустая строка — новый абзац.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Фото (будут в конце письма)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.avif"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={isSubmitting || isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploading}
                className="h-9 gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {isUploading ? "Загрузка…" : "Загрузить фото"}
              </Button>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP, AVIF, до 10 МБ. Можно удалить фото крестиком и загрузить другие.
              </span>
            </div>
            {uploadedUrls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {uploadedUrls.map((url) => (
                  <div key={url} className="relative group">
                    {/* Динамические URL загруженных превью; next/image не подходит для произвольных blob/data URL в форме */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-14 w-14 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setUploadedUrls((prev) => prev.filter((u) => u !== url))}
                      disabled={isSubmitting}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors disabled:opacity-50"
                      aria-label="Удалить фото"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Предпросмотр */}
          <div className="space-y-2">
            <Label>Предпросмотр</Label>
            <div className="rounded-lg border bg-muted/20 overflow-hidden">
              <iframe
                title="Предпросмотр письма"
                srcDoc={previewHtml(fullBodyHtml)}
                className="w-full min-h-[240px] max-h-[320px] border-0 bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </div>

          {template && (
            <p className="text-xs text-muted-foreground">
              Шаблон «{template.name}»: {template.description}
            </p>
          )}

          <DialogFooter className="flex flex-row justify-end gap-4 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 min-w-[100px]"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !subject.trim()}
              className="h-9 min-w-[120px] bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Создание…
                </>
              ) : (
                "Создать"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
