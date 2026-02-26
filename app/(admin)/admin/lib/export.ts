/**
 * Утилиты для экспорта данных в CSV
 */

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers: Record<keyof T, string>,
): void {
  if (data.length === 0) {
    return;
  }

  // Создаем заголовки
  const headerRow = Object.values(headers).join(",");

  // Создаем строки данных
  const dataRows = data.map((row) => {
    return Object.keys(headers)
      .map((key) => {
        const value = row[key];
        // Экранируем запятые и кавычки
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",");
  });

  // Объединяем все строки
  const csvContent = [headerRow, ...dataRows].join("\n");

  // Создаем BOM для корректного отображения кириллицы в Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Создаем ссылку для скачивания
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDateForExport(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
