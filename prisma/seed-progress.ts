/**
 * Утилиты для красивого отображения прогресса сидинга
 */

export interface SeedStep {
  name: string;
  emoji: string;
  execute: () => Promise<void>;
}

export class SeedProgress {
  private steps: SeedStep[] = [];
  private currentStep = 0;
  private startTime = Date.now();

  constructor(steps: SeedStep[]) {
    this.steps = steps;
  }

  /**
   * Очищает текущую строку и выводит новый прогресс
   */
  private updateProgress(stepName: string, current: number, total: number) {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((percentage / 100) * 40);
    const empty = 40 - filled;

    const bar = "█".repeat(filled) + "░".repeat(empty);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

    // ANSI escape codes для цветов
    const colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      dim: "\x1b[2m",
      green: "\x1b[32m",
      blue: "\x1b[34m",
      yellow: "\x1b[33m",
      cyan: "\x1b[36m",
      magenta: "\x1b[35m",
      gray: "\x1b[90m",
    };

    // Очищаем строку (перемещаем курсор в начало и очищаем до конца)
    process.stdout.write("\r\x1b[K");

    // Выводим прогресс-бар
    process.stdout.write(
      `${colors.cyan}${bar}${colors.reset} ${colors.bright}${percentage}%${colors.reset} ` +
      `${colors.gray}[${current}/${total}]${colors.reset} ` +
      `${colors.yellow}${stepName}${colors.reset} ` +
      `${colors.dim}(${elapsed}s)${colors.reset}`
    );
  }

  /**
   * Выполняет все шаги с прогресс-баром
   */
  async execute(): Promise<void> {
    console.log("\n🌱 Начинаем сидинг базы данных...\n");

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      this.currentStep = i + 1;

      // Обновляем прогресс перед выполнением
      this.updateProgress(step.name, i, this.steps.length);

      try {
        await step.execute();

        // После выполнения обновляем прогресс с завершенным статусом
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        const colors = {
          reset: "\x1b[0m",
          green: "\x1b[32m",
          dim: "\x1b[2m",
          gray: "\x1b[90m",
        };

        process.stdout.write("\r\x1b[K");
        console.log(
          `  ${step.emoji} ${colors.green}✓${colors.reset} ${step.name} ${colors.dim}(${elapsed}s)${colors.reset}`
        );

      } catch (error) {
        const colors = {
          reset: "\x1b[0m",
          red: "\x1b[31m",
        };
        process.stdout.write("\r\x1b[K");
        console.error(`  ${step.emoji} ${colors.red}✗${colors.reset} ${step.name} - Ошибка!`);
        if (error instanceof Error) {
          console.error(`  ${colors.red}${error.message}${colors.reset}`);
        }
        throw error;
      }
    }

    // Финальный прогресс - 100%
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      green: "\x1b[32m",
      cyan: "\x1b[36m",
    };

    console.log(`\n${colors.green}${colors.bright}████████████████████████████████████████████████ 100%${colors.reset}\n`);
    console.log(`${colors.cyan}✨ Сидинг завершен успешно!${colors.reset} (${totalTime}s)\n`);
  }
}

/**
 * Вспомогательная функция для создания шага сидинга
 */
export function createStep(
  name: string,
  emoji: string,
  execute: () => Promise<void>
): SeedStep {
  return { name, emoji, execute };
}
