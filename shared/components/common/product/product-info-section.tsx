interface ProductInfoSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Секция с заголовком для блока информации о товаре (Описание, Цвет, Размер).
 */
export function ProductInfoSection({ title, children }: ProductInfoSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  );
}
