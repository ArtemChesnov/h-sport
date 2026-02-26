/**
 * Типы для дашборда Web Vitals метрик
 */

export interface WebVitalsData {
  period: {
    from: string;
    to: string;
    windowMs: number;
  };
  totalMetrics: number;
  statsByType: Record<
    string,
    {
      count: number;
      avg: number;
      min: number;
      max: number;
      p50: number;
      p75: number;
      p95: number;
      p99: number;
    }
  >;
  timeSeries: Array<{
    timestamp: number;
    metrics: Array<{
      name: string;
      avgValue: number;
      count: number;
    }>;
  }>;
  topPages: Array<{
    url: string;
    metrics: Record<string, number>;
  }>;
}

export type PeriodOption = "1d" | "7d" | "30d" | "90d";

// Пороговые значения для Web Vitals (в миллисекундах для LCP, INP, TTFB, FCP; без единиц для CLS)
export const WEB_VITALS_THRESHOLDS: Record<string, { good: number; needsImprovement: number }> = {
  LCP: { good: 2500, needsImprovement: 4000 }, // ms
  INP: { good: 200, needsImprovement: 500 }, // ms (заменил FID)
  CLS: { good: 0.1, needsImprovement: 0.25 }, // без единиц
  FCP: { good: 1800, needsImprovement: 3000 }, // ms
  TTFB: { good: 800, needsImprovement: 1800 }, // ms
};

// Краткие объяснения метрик Web Vitals
export const METRIC_DESCRIPTIONS: Record<string, string> = {
  LCP: "Время загрузки самого большого элемента",
  INP: "Время отклика на взаимодействие пользователя",
  CLS: "Стабильность визуального контента",
  FCP: "Время первого отображения контента",
  TTFB: "Время до первого байта ответа сервера",
};

// Подробные объяснения метрик Web Vitals
export const METRIC_DETAILED_DESCRIPTIONS: Record<string, string> = {
  LCP: "Largest Contentful Paint (LCP) измеряет время загрузки самого большого видимого элемента на странице (изображение, видео или текстовый блок). Хорошее значение: ≤2.5с. Показывает, насколько быстро пользователь видит основной контент.",
  INP: "Interaction to Next Paint (INP) измеряет время отклика на взаимодействие пользователя (клик, нажатие клавиши, тап). Хорошее значение: ≤200мс. Заменил FID (First Input Delay) как более точную метрику отзывчивости.",
  CLS: "Cumulative Layout Shift (CLS) измеряет визуальную стабильность страницы. Показывает, насколько элементы страницы смещаются во время загрузки. Хорошее значение: ≤0.1. Высокий CLS означает, что контент смещается при загрузке.",
  FCP: "First Contentful Paint (FCP) измеряет время до первого отображения любого контента на странице (текст, изображение, SVG). Хорошее значение: ≤1.8с. Показывает, как быстро пользователь видит, что страница загружается.",
  TTFB: "Time to First Byte (TTFB) измеряет время от запроса страницы до получения первого байта ответа от сервера. Хорошее значение: ≤800мс. Показывает скорость работы сервера и сети.",
};

// Основные метрики для отображения
export const CORE_METRICS = ["LCP", "INP", "CLS", "FCP", "TTFB"];

// Объяснение перцентилей
export const PERCENTILE_EXPLANATION = `Перцентили показывают распределение значений:
• P50 (медиана) - половина измерений лучше этого значения
• P95 - 95% измерений лучше этого значения (показывает типичные "худшие" случаи)
• P99 - 99% измерений лучше этого значения (показывает экстремальные случаи)

P95 и P99 важны для понимания реального опыта пользователей, так как среднее значение может скрывать проблемы.`;
