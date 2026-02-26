/**
 * Скрипт для остановки Redis при разработке.
 */

const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
};

function log(message, color = colors.reset) {
  console.log(`${color}[Redis]${colors.reset} ${message}`);
}

// Проверяем, запущен ли Redis
function isRedisRunning() {
  try {
    execSync("redis-cli ping", { stdio: "ignore", timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

// Проверяем, есть ли Docker Compose с Redis
function hasRedisInDocker() {
  const { existsSync } = require("fs");
  const composeFiles = ["docker-compose.yml", "docker-compose.yaml"];
  for (const file of composeFiles) {
    if (existsSync(file)) {
      try {
        const content = require("fs").readFileSync(file, "utf8");
        if (content.includes("redis") || content.includes("Redis")) {
          return true;
        }
      } catch {
        // Игнорируем ошибки чтения
      }
    }
  }
  return false;
}

// Останавливаем Redis
function main() {
  // Пытаемся остановить Docker контейнер redis-dev
  try {
    const output = execSync("docker ps -q -f name=redis-dev", { encoding: "utf8", stdio: "pipe" }).trim();
    if (output) {
      execSync("docker stop redis-dev", { stdio: "inherit" });
      log("Redis контейнер (redis-dev) остановлен", colors.green);
      return;
    }
  } catch {
    // Игнорируем ошибки Docker
  }

  // Проверяем, запущен ли локальный Redis
  if (!isRedisRunning()) {
    log("Redis не запущен", colors.yellow);
    return;
  }

  // Останавливаем локальный Redis
  try {
    execSync("redis-cli shutdown", { stdio: "ignore" });
    log("Redis остановлен", colors.green);
  } catch {
    log("Не удалось остановить Redis. Возможно, процесс уже завершён.", colors.yellow);
  }
}

main();
