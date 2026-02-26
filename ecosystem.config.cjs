/**
 * PM2: конфиг для продакшена.
 * Запуск: pm2 start ecosystem.config.cjs
 * Перезапуск после деплоя: pm2 restart h-sport --update-env
 *
 * На сервере задайте переменные окружения в .env в каталоге приложения;
 * PM2 при start загрузит их, если запускать из этого каталога (--env production при необходимости).
 */
module.exports = {
  apps: [
    {
      name: "h-sport",
      cwd: __dirname,
      script: "node",
      args: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "500M",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};
