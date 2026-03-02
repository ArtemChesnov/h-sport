/**
 * PM2: конфиг для продакшена.
 * Запуск: pm2 start ecosystem.config.cjs
 * Перезапуск после деплоя: pm2 restart h-sport --update-env
 *
 * max_memory_restart: PM2 перезапускает процесс при превышении этого порога (RSS).
 * interpreter_args: флаги для node (--max-old-space-size).
 *
 * .env загружается автоматически из каталога приложения и передаётся процессу.
 */
const path = require("path");
const fs = require("fs");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  const vars = {};
  try {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      vars[key] = value;
    }
  } catch {
    // .env not found — rely on system env vars
  }
  return vars;
}

const dotenvVars = loadEnvFile();

module.exports = {
  apps: [
    {
      name: "h-sport",
      cwd: __dirname,
      script: "node",
      args: ".next/standalone/server.js",
      interpreter_args: "--max-old-space-size=1400",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", ...dotenvVars },
      max_memory_restart: "1600M",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};
