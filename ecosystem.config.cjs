/**
 * PM2: конфиг для продакшена.
 * Запуск: pm2 start ecosystem.config.cjs
 * Перезапуск после деплоя: pm2 restart h-sport --update-env
 *
 * На сервере задайте переменные окружения в .env в каталоге приложения;
 * PM2 при start загрузит их, если запускать из этого каталога (--env production при необходимости).
 *
 * max_memory_restart: PM2 перезапускает процесс при превышении этого порога (RSS).
 * node_args --max-old-space-size: лимит heap V8 (без этого под heap выделяется мало, т.к. процесс упирается в 500M и перезапускается).
 */
module.exports = {
  apps: [
    {
      name: "h-sport",
      cwd: __dirname,
      script: "node",
      args: ".next/standalone/server.js",
      node_args: "--max-old-space-size=1400",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "1600M",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};
