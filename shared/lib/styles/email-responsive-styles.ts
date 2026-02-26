/**
 * Адаптивные стили для писем: от 390px (iPhone 12 и уже) текст и отступы не слипаются.
 * Подключать в <head> каждого шаблона; блоки с классами — в разметке писем.
 */

export const EMAIL_RESPONSIVE_STYLE = `
<style type="text/css">
  .email-header,
  .email-body,
  .email-footer {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .email-order-block {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  @media only screen and (max-width: 390px) {
    .email-wrap {
      margin: 16px 12px !important;
      max-width: none !important;
      border-radius: 10px !important;
    }
    .email-header {
      padding: 20px 16px !important;
    }
    .email-body {
      padding: 24px 16px !important;
    }
    .email-body h1 {
      font-size: 20px !important;
      margin-bottom: 12px !important;
    }
    .email-body h2 {
      font-size: 18px !important;
      margin-bottom: 16px !important;
    }
    .email-body p {
      margin-bottom: 20px !important;
    }
    .email-footer {
      padding: 16px !important;
    }
    .email-order-block {
      padding: 16px !important;
      margin-bottom: 20px !important;
    }
    .email-order-block h2 {
      font-size: 18px !important;
      margin-bottom: 16px !important;
    }
    .email-order-row {
      margin-bottom: 10px !important;
      font-size: 13px !important;
    }
    .email-order-total {
      font-size: 18px !important;
      margin-top: 12px !important;
    }
    .email-link-block {
      word-break: break-all !important;
      padding: 10px !important;
      font-size: 11px !important;
    }
    .email-cta-wrap {
      margin: 24px 0 !important;
    }
    .email-table-cell {
      padding: 10px 6px !important;
      font-size: 13px !important;
    }
    .email-table-cell-name {
      min-width: 0 !important;
      word-break: break-word !important;
    }
  }
  /* До 480px — чуть смягчённые отступы для средних телефонов */
  @media only screen and (max-width: 480px) {
    .email-wrap {
      margin: 20px 16px !important;
    }
    .email-header {
      padding: 24px 20px !important;
    }
    .email-body {
      padding: 28px 20px !important;
    }
    .email-footer {
      padding: 20px !important;
    }
    .email-order-block {
      padding: 20px !important;
    }
  }
  /* Предотвращение автоуменьшения шрифта на iOS */
  body {
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }
</style>`;
