import { StoreEmptyBlock } from "@/shared/components/common";
import { CTA } from "@/shared/constants";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-40 min-h-[50vh]">
      <StoreEmptyBlock
        title="Страница не найдена"
        description="Проверьте корректность введённого адреса или повторите попытку позже"
        action={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
      />
    </div>
  );
}
