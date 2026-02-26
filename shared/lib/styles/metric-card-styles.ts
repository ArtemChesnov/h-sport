/**
 * Константы стилей для карточек метрик
 */

export type MetricCardColor =
  | "emerald"
  | "cyan"
  | "indigo"
  | "amber"
  | "red"
  | "blue"
  | "slate"
  | "violet"
  | "green"
  | "orange"
  | "rose"
  | "teal"
  | "purple"
  | "pink";

export const METRIC_CARD_STYLES: Record<
  MetricCardColor,
  {
    gradient: string;
    border: string;
    shadow: string;
    iconColor: string;
    textColor: string;
    titleColor: string;
  }
> = {
  emerald: {
    gradient: "bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-teal-50",
    border: "border-emerald-200/60",
    shadow: "shadow-emerald-100/20",
    iconColor: "text-emerald-600",
    textColor: "text-emerald-700",
    titleColor: "text-emerald-900",
  },
  cyan: {
    gradient: "bg-gradient-to-br from-cyan-50 via-cyan-50/80 to-sky-50",
    border: "border-cyan-200/60",
    shadow: "shadow-cyan-100/20",
    iconColor: "text-cyan-600",
    textColor: "text-cyan-700",
    titleColor: "text-cyan-900",
  },
  indigo: {
    gradient: "bg-gradient-to-br from-indigo-50 via-indigo-50/80 to-violet-50",
    border: "border-indigo-200/60",
    shadow: "shadow-indigo-100/20",
    iconColor: "text-indigo-600",
    textColor: "text-indigo-700",
    titleColor: "text-indigo-900",
  },
  amber: {
    gradient: "bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50",
    border: "border-amber-200/60",
    shadow: "shadow-amber-100/20",
    iconColor: "text-amber-600",
    textColor: "text-amber-700",
    titleColor: "text-amber-900",
  },
  red: {
    gradient: "bg-gradient-to-br from-red-50 via-red-50/80 to-rose-50",
    border: "border-red-200/60",
    shadow: "shadow-red-100/20",
    iconColor: "text-red-600",
    textColor: "text-red-700",
    titleColor: "text-red-900",
  },
  blue: {
    gradient: "bg-gradient-to-br from-blue-50 via-blue-50/80 to-cyan-50",
    border: "border-blue-200/60",
    shadow: "shadow-blue-100/20",
    iconColor: "text-blue-600",
    textColor: "text-blue-700",
    titleColor: "text-blue-900",
  },
  slate: {
    gradient: "bg-gradient-to-br from-slate-50 via-slate-50/80 to-zinc-50",
    border: "border-slate-200/60",
    shadow: "shadow-slate-100/20",
    iconColor: "text-slate-600",
    textColor: "text-slate-700",
    titleColor: "text-slate-900",
  },
  violet: {
    gradient: "bg-gradient-to-br from-violet-50 via-violet-50/80 to-purple-50",
    border: "border-violet-200/60",
    shadow: "shadow-violet-100/20",
    iconColor: "text-violet-600",
    textColor: "text-violet-700",
    titleColor: "text-violet-900",
  },
  green: {
    gradient: "bg-gradient-to-br from-green-50 via-green-50/80 to-emerald-50",
    border: "border-green-200/60",
    shadow: "shadow-green-100/20",
    iconColor: "text-green-600",
    textColor: "text-green-700",
    titleColor: "text-green-900",
  },
  orange: {
    gradient: "bg-gradient-to-br from-orange-50 via-orange-50/80 to-red-50",
    border: "border-orange-200/60",
    shadow: "shadow-orange-100/20",
    iconColor: "text-orange-600",
    textColor: "text-orange-700",
    titleColor: "text-orange-900",
  },
  rose: {
    gradient: "bg-gradient-to-br from-rose-50 via-rose-50/80 to-pink-50",
    border: "border-rose-200/60",
    shadow: "shadow-rose-100/20",
    iconColor: "text-rose-600",
    textColor: "text-rose-700",
    titleColor: "text-rose-900",
  },
  teal: {
    gradient: "bg-gradient-to-br from-teal-50 via-teal-50/80 to-cyan-50",
    border: "border-teal-200/60",
    shadow: "shadow-teal-100/20",
    iconColor: "text-teal-600",
    textColor: "text-teal-700",
    titleColor: "text-teal-900",
  },
  purple: {
    gradient: "bg-gradient-to-br from-purple-50 via-purple-50/80 to-violet-50",
    border: "border-purple-200/60",
    shadow: "shadow-purple-100/20",
    iconColor: "text-purple-600",
    textColor: "text-purple-700",
    titleColor: "text-purple-900",
  },
  pink: {
    gradient: "bg-gradient-to-br from-pink-50 via-pink-50/80 to-rose-50",
    border: "border-pink-200/60",
    shadow: "shadow-pink-100/20",
    iconColor: "text-pink-600",
    textColor: "text-pink-700",
    titleColor: "text-pink-900",
  },
} as const;
