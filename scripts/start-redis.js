/**
 * Скрипт для автоматического запуска Redis при разработке.
 * Проверяет доступность Redis и запускает через Docker или локально.
 */

const { execSync, spawn } = require("child_process");
const { existsSync } = require("fs");

// Цвета для консоли
const colors = {
  reset: "\x1b[0m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}[Redis]${colors.reset} ${message}`);
}

// Проверяем, запущен ли Redis
function isRedisRunning() {
  try {
    // Сначала пробуем через Docker (если контейнер запущен)
    try {
      // Проверяем, запущен ли контейнер
      const containerRunning = execSync("docker ps -q -f name=redis-dev", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 1000
      }).trim();

      if (containerRunning) {
        // Контейнер запущен - проверяем Redis внутри него
        const output = execSync("docker exec redis-dev redis-cli ping", {
          encoding: "utf8",
          stdio: "pipe",
          timeout: 2000
        }).trim();
        return output === "PONG";
      }
    } catch {
      // Игнорируем ошибки Docker
    }

    // Если Docker не помог, пробуем локально
    try {
      execSync("redis-cli ping", { stdio: "ignore", timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

// Проверяем, есть ли Docker
function hasDocker() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Запускаем Redis через Docker (standalone container)
async function startRedisDocker() {
  log("Запуск Redis через Docker...", colors.blue);

  // Проверяем, запущен ли уже контейнер redis-dev
  try {
    const output = execSync("docker ps -q -f name=redis-dev", { encoding: "utf8", stdio: "pipe" }).trim();
    if (output) {
      log("Redis контейнер (redis-dev) уже запущен, проверяем доступность...", colors.blue);
      // Проверяем, отвечает ли Redis
      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        if (isRedisRunning()) {
          log("Redis контейнер (redis-dev) уже запущен и отвечает ✓", colors.green);
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
      log("Контейнер запущен, но Redis не отвечает. Попробуем перезапустить...", colors.yellow);
      // Попробуем перезапустить контейнер
      try {
        execSync("docker restart redis-dev", { stdio: "pipe" });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (isRedisRunning()) {
          log("Redis контейнер перезапущен и отвечает ✓", colors.green);
          return true;
        }
      } catch (error) {
        log(`Не удалось перезапустить контейнер: ${error.message}`, colors.yellow);
      }
      return false;
    }
  } catch {
    // Игнорируем ошибки проверки
  }

  // Проверяем, существует ли контейнер (остановлен)
  try {
    const output = execSync("docker ps -aq -f name=redis-dev", { encoding: "utf8", stdio: "pipe" }).trim();
    if (output) {
      // Контейнер существует, но остановлен - запускаем его
      log("Перезапуск существующего контейнера Redis (redis-dev)...", colors.blue);
      try {
        execSync("docker start redis-dev", { stdio: "pipe" });
        // Ждём и проверяем готовность Redis
        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (isRedisRunning()) {
            log("Redis контейнер перезапущен и отвечает ✓", colors.green);
            return true;
          }
          attempts++;
        }
        log("Контейнер перезапущен, но Redis не отвечает", colors.yellow);
        return false;
      } catch (error) {
        log(`Ошибка перезапуска контейнера: ${error.message}`, colors.yellow);
        return false;
      }
    }
  } catch {
    // Игнорируем ошибки
  }

  // Создаём новый контейнер Redis
  log("Создание нового контейнера Redis (redis-dev)...", colors.blue);
  try {
    // Используем execSync для синхронного выполнения (ждём результата)
    execSync("docker run -d --name redis-dev -p 6379:6379 redis:alpine", {
      stdio: "pipe",
      encoding: "utf8",
    });
    // Ждём и проверяем готовность Redis (до 10 секунд)
    let attempts = 0;
    const maxAttempts = 20;
    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isRedisRunning()) {
        log("Redis контейнер (redis-dev) создан и отвечает ✓", colors.green);
        return true;
      }
      attempts++;
    }
    log("Контейнер создан, но Redis не отвечает после ожидания", colors.yellow);
    // Проверяем статус контейнера для диагностики
    try {
      const containerStatus = execSync("docker ps -a -f name=redis-dev --format '{{.Status}}'", {
        encoding: "utf8",
        stdio: "pipe"
      }).trim();
      if (containerStatus) {
        log(`Статус контейнера: ${containerStatus}`, colors.yellow);
      } else {
        log("Контейнер не найден - возможно он упал при запуске", colors.yellow);
      }

      // Проверяем логи контейнера для диагностики
      try {
        const logs = execSync("docker logs --tail 5 redis-dev 2>&1", {
          encoding: "utf8",
          stdio: "pipe",
          maxBuffer: 1024 * 10
        }).trim();
        if (logs) {
          log(`Последние логи контейнера:\n${logs}`, colors.yellow);
        }
      } catch {
        // Игнорируем ошибки чтения логов
      }
    } catch {
      // Игнорируем ошибки
    }
    return false;
  } catch (error) {
    // Проверяем, возможно контейнер уже существует
    try {
      const output = execSync("docker ps -aq -f name=redis-dev", { encoding: "utf8", stdio: "pipe" }).trim();
      if (output) {
        // Контейнер существует - попробуем запустить
        execSync("docker start redis-dev", { stdio: "pipe" });
        // Ждём и проверяем готовность Redis
        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (isRedisRunning()) {
            log("Redis контейнер запущен и отвечает ✓", colors.green);
            return true;
          }
          attempts++;
        }
        log("Контейнер запущен, но Redis не отвечает", colors.yellow);
        return false;
      }
    } catch {
      // Игнорируем ошибки
    }
    log(`Не удалось создать контейнер: ${error.message}`, colors.yellow);
    return false;
  }
}

// Запускаем Redis локально
function startRedisLocal() {
  log("Запуск Redis локально (redis-server)...", colors.blue);

  // Проверяем, установлен ли redis-server
  try {
    execSync("redis-server --version", { stdio: "ignore" });
  } catch {
    log("redis-server не найден.", colors.yellow);
    log("  Windows: https://github.com/microsoftarchive/redis/releases", colors.yellow);
    log("  Или используйте Docker: docker run -d --name redis-dev -p 6379:6379 redis:alpine", colors.yellow);
    log("Redis не запущен. Приложение будет работать с in-memory fallback.", colors.yellow);
    // Возвращаем процесс, который ничего не делает, но не завершается
    const noop = () => {};
    return {
      on: noop,
      kill: noop,
      unref: noop,
    };
  }

  const redisServer = spawn("redis-server", [], {
    stdio: "inherit",
    shell: true,
    detached: false,
  });

  redisServer.on("close", (code) => {
    if (code !== null && code !== 0) {
      log(`Redis сервер остановлен (код ${code})`, colors.yellow);
    }
  });

  redisServer.on("error", (err) => {
    log(`Ошибка запуска Redis: ${err.message}`, colors.red);
  });

  return redisServer;
}

// Основная логика
async function main() {
  // Проверяем, запущен ли уже Redis
  if (isRedisRunning()) {
    log("Redis уже запущен ✓", colors.green);
    // Не завершаем процесс, чтобы concurrently продолжал работать
    process.stdin.resume();
    return;
  }

  // Пытаемся запустить через Docker, если доступен
  if (hasDocker()) {
    try {
      const dockerSuccess = await startRedisDocker();

      if (dockerSuccess) {
        // Ждём и проверяем готовность Redis (до 5 секунд)
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (isRedisRunning()) {
            log("Redis успешно запущен через Docker ✓", colors.green);
            process.stdin.resume();
            return;
          }
          attempts++;
        }
        // Если Redis не запустился после ожидания, продолжаем к локальному варианту
        log("Docker контейнер создан, но Redis не отвечает. Пытаемся локально...", colors.yellow);
      } else {
        log("Не удалось запустить через Docker. Пытаемся локально...", colors.yellow);
      }
    } catch (error) {
      log(`Ошибка при запуске через Docker: ${error.message}`, colors.yellow);
    }
  } else {
    log("Docker не найден. Пытаемся запустить Redis локально...", colors.yellow);
  }

  // Если Docker не подошёл, пытаемся запустить локально
  const redisProcess = startRedisLocal();

  // Обработка сигналов завершения
  const cleanup = () => {
    log("Остановка Redis...", colors.yellow);
    if (redisProcess && redisProcess.kill) {
      try {
        redisProcess.kill();
      } catch {
        // Игнорируем ошибки
      }
    }
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Не завершаем процесс - пусть Redis работает
  if (redisProcess && redisProcess.unref) {
    redisProcess.unref();
  } else {
    // Если unref недоступен, просто не завершаем процесс
    process.stdin.resume();
  }
}

main().catch((error) => {
  log(`Ошибка: ${error.message}`, colors.red);
  log("Redis не запущен. Приложение будет работать с in-memory fallback.", colors.yellow);
  // Не завершаем процесс, чтобы не остановить Next.js
  process.stdin.resume();
});
