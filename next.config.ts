import type { NextConfig } from "next";

// Bundle analyzer (только для анализа, не влияет на production)
const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- next.config.ts использует require для условной загрузки bundle analyzer
      require("@next/bundle-analyzer")({
        enabled: process.env.ANALYZE === "true",
        openAnalyzer: false, // Не открывать автоматически браузер
        analyzerMode: "static", // Генерировать статические файлы
        reportFilename: "bundle-analyzer-report.html",
        generateStatsFile: true,
        statsFilename: "bundle-stats.json",
      })
    : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Production: standalone для деплоя на VPS (один каталог с server.js и минимальным node_modules)
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),

  // Компрессия ответов (Next.js делает это автоматически, но можно настроить)
  compress: true,

  // Оптимизация изображений
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // Кеширование оптимизированных изображений на 24 часа
    // Разрешенные домены для внешних изображений (если используются)
    remotePatterns: [
      // Добавьте домены вашего CDN или внешних источников изображений
      // {
      //   protocol: "https",
      //   hostname: "cdn.example.com",
      // },
    ],
  },

  // Оптимизация bundle и компиляции
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-sheet",
      "lucide-react",
      "recharts",
    ],
  },

  // Code splitting для оптимизации bundle size
  webpack: (config, { isServer, dev }) => {
    // Workaround: server pages runtime требует require("./7627.js") из .next/server/, чанки в .next/server/chunks/
    if (isServer && !dev) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- next.config webpack runs in Node, sync require needed
      const { copyServerChunksPlugin } = require("./scripts/copy-server-chunks-plugin.js");
      config.plugins.push(copyServerChunksPlugin());
    }

    // Исключаем Node.js-специфичные модули из клиентского bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        child_process: false,
      };
    }

    if (!isServer) {
      if (dev) {
        // В dev режиме не используем кастомный splitChunks — Next.js по умолчанию не создаёт
        // отдельный vendor.css, который браузер может ошибочно загрузить как JS и выдать
        // "Uncaught SyntaxError: Invalid or unexpected token" в vendor.css.
        // Оставляем дефолтную разбивку чанков.
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
        };
      } else {
        // Production: чанки по маршрутам (админка не в одном чанке), Recharts и Radix — отдельно
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: "all",
            maxInitialRequests: 25,
            minSize: 20000,
            cacheGroups: {
              default: false,
              vendors: false,
              // Recharts — отдельный чанк, подгружается только на страницах с графиками
              charts: {
                name: "charts",
                test: /[\\/]node_modules[\\/](recharts)/,
                priority: 20,
                reuseExistingChunk: true,
                enforce: true,
              },
              // Radix UI — общий для админки и витрины
              radix: {
                name: "radix",
                test: /[\\/]node_modules[\\/](@radix-ui)/,
                priority: 18,
                reuseExistingChunk: true,
                enforce: true,
              },
              // Остальные node_modules (React и т.д.)
              vendor: {
                name: "vendor",
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                reuseExistingChunk: true,
              },
            },
          },
        };
      }
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
