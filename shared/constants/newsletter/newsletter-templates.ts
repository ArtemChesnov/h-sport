/**
 * Шаблоны писем рассылки H-Sport. Адаптивные, отлично выглядят на телефоне и в десктопе.
 * Плейсхолдеры: {{content}}, {{unsubscribe_link}}, {{shop_url}}.
 */

export type NewsletterTemplateId = "simple" | "with-header" | "two-columns";

export interface NewsletterTemplate {
  id: NewsletterTemplateId;
  name: string;
  description: string;
  html: string;
}

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";
const PRIMARY = "#EB6081";
const PRIMARY_DARK = "#d94a6b";
const TEXT = "#1a1a1a";
const BG = "#f5f4f4";
const CARD_BG = "#ffffff";
const BORDER = "#e8e6e6";
const FOOTER_TEXT = "#888";
const ACCENT_BG = "#fdf7f8";

const RESPONSIVE_STYLE = `
  @media only screen and (max-width: 600px) {
    body { padding: 12px 10px !important; font-size: 17px !important; line-height: 1.7 !important; -webkit-text-size-adjust: 100%; }
    .n-wrap { padding: 28px 20px !important; border-radius: 12px !important; }
    .n-footer { padding: 20px 20px !important; font-size: 14px !important; }
    .n-cta-block { padding: 28px 20px !important; }
    .n-btn { display: block !important; width: 100% !important; max-width: 280px !important; margin: 0 auto !important; padding: 16px 24px !important; font-size: 16px !important; text-align: center !important; box-sizing: border-box !important; }
    .n-header-inner { padding: 28px 20px !important; }
    .n-header-title { font-size: 24px !important; }
    .n-content { padding: 28px 20px 24px !important; }
    .n-unsub { font-size: 14px !important; }
  }
`;

export const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  {
    id: "simple",
    name: "Простой",
    description: "Минимум оформления: текст и отписка",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${RESPONSIVE_STYLE}</style>
</head>
<body style="margin:0; padding:24px 16px; font-family:${FONT}; font-size:16px; line-height:1.65; color:${TEXT}; background:${BG}; -webkit-text-size-adjust:100%;">
  <div class="n-wrap" style="max-width:560px; margin:0 auto; background:${CARD_BG}; border-radius:16px; padding:40px 36px; box-shadow:0 8px 32px rgba(0,0,0,0.08);">
    <div style="margin-bottom:32px;">{{content}}</div>
    <p class="n-footer n-unsub" style="margin:0; padding-top:24px; border-top:1px solid ${BORDER}; font-size:13px; color:${FOOTER_TEXT};">
      <a href="{{unsubscribe_link}}" style="color:${FOOTER_TEXT}; text-decoration:underline;">Отписаться от рассылки</a>
    </p>
  </div>
</body>
</html>`,
  },
  {
    id: "with-header",
    name: "С шапкой",
    description: "Яркая шапка с брендом, текст ниже",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${RESPONSIVE_STYLE}</style>
</head>
<body style="margin:0; padding:24px 16px; font-family:${FONT}; font-size:16px; line-height:1.65; color:${TEXT}; background:${BG}; -webkit-text-size-adjust:100%;">
  <div style="max-width:560px; margin:0 auto; background:${CARD_BG}; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.08);">
    <div class="n-header-inner" style="padding:32px 24px; background:linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%); text-align:center;">
      <span class="n-header-title" style="font-size:26px; font-weight:700; letter-spacing:-0.03em; color:#fff;">H-Sport</span>
      <p style="margin:8px 0 0; font-size:13px; color:rgba(255,255,255,0.9);">Спорт и стиль для тебя</p>
    </div>
    <div class="n-content" style="padding:36px 36px 32px;">
      <div style="margin-bottom:28px;">{{content}}</div>
      <p class="n-footer n-unsub" style="margin:0; padding-top:24px; border-top:1px solid ${BORDER}; font-size:13px;">
        <a href="{{unsubscribe_link}}" style="color:${FOOTER_TEXT}; text-decoration:underline;">Отписаться от рассылки</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: "two-columns",
    name: "С призывом в магазин",
    description: "Текст и блок с кнопкой «Перейти в магазин» — одна колонка, отлично на телефоне",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${RESPONSIVE_STYLE}</style>
</head>
<body style="margin:0; padding:24px 16px; font-family:${FONT}; font-size:16px; line-height:1.65; color:${TEXT}; background:${BG}; -webkit-text-size-adjust:100%;">
  <div style="max-width:560px; margin:0 auto; background:${CARD_BG}; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.08);">
    <div class="n-content" style="padding:36px 36px 28px;">
      <div style="margin-bottom:0;">{{content}}</div>
    </div>
    <div class="n-cta-block" style="padding:32px 36px; background:${ACCENT_BG}; border-top:1px solid ${BORDER}; text-align:center;">
      <p style="margin:0 0 16px; font-size:15px; font-weight:600; color:${TEXT};">Загляните в каталог — новинки и акции</p>
      <a href="{{shop_url}}" class="n-btn" style="display:inline-block; padding:14px 28px; background:linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%); color:#fff !important; text-decoration:none; font-weight:600; font-size:15px; border-radius:12px; box-shadow:0 4px 14px rgba(235,96,129,0.35);">Перейти в магазин</a>
    </div>
    <div class="n-footer" style="padding:20px 32px; background:#fafafa; border-top:1px solid ${BORDER};">
      <p class="n-unsub" style="margin:0; font-size:13px;">
        <a href="{{unsubscribe_link}}" style="color:${FOOTER_TEXT}; text-decoration:underline;">Отписаться от рассылки</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  },
];

export function getNewsletterTemplateById(id: NewsletterTemplateId): NewsletterTemplate | undefined {
  return NEWSLETTER_TEMPLATES.find((t) => t.id === id);
}

export function plainTextToHtml(text: string): string {
  if (!text.trim()) return "<p></p>";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const paragraphs = escaped.split(/\n\n+/).filter((p) => p.trim());
  if (paragraphs.length === 0) return "<p></p>";
  return paragraphs
    .map((p) => `<p style="margin: 0 0 1em;">${p.trim().replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function buildNewsletterBodyHtml(templateId: NewsletterTemplateId, content: string): string {
  const template = getNewsletterTemplateById(templateId);
  if (!template) return content;
  return template.html.replace(/\{\{content\}\}/g, content || "");
}
