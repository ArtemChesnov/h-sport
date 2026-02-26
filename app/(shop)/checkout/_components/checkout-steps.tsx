"use client";

import { CreditCardIcon, HomeIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import { useShopNav } from "@/shared/contexts";
import { cn } from "@/shared/lib";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const DOTS_COUNT_WIDE = 50;
const DOTS_COUNT_NARROW = 18;
const NARROW_BREAKPOINT_PX = 625;

const STEPS = [
  { href: "/checkout", label: "Адрес доставки", icon: HomeIcon },
  { href: "/checkout/payment", label: "Оплата", icon: CreditCardIcon },
  { href: "/checkout/success", label: "Завершение", icon: CheckCircle2 },
];

function getStepIndexForPath(path: string): number {
  if (path === "/checkout/success") return 2;
  if (path === "/checkout/payment") return 1;
  return 0;
}

export const CheckoutSteps: React.FC = () => {
  const pathname = usePathname();
  const { pendingPath, setPendingPath } = useShopNav();
  const [dotsCount, setDotsCount] = useState(DOTS_COUNT_WIDE);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT_PX}px)`);
    const update = () => setDotsCount(mql.matches ? DOTS_COUNT_NARROW : DOTS_COUNT_WIDE);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const effectivePath = pendingPath ?? pathname;
  const currentStepIndex = getStepIndexForPath(effectivePath);

  const handleStepClick = (href: string) => {
    setPendingPath(href);
  };

  return (
    <nav className="flex items-center justify-between w-full min-w-0 max-w-[890px] pb-4 gap-1 max-[625px]:gap-0.5 max-[390px]:gap-0">
      {STEPS.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        const shouldColorDots = index < currentStepIndex;
        const IconComponent = step.icon;

        return (
          <React.Fragment key={step.href}>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-1 flex-shrink-0 h-auto p-0 hover:bg-transparent min-w-0 max-[576px]:gap-1 max-[625px]:min-w-0 max-[390px]:gap-0.5",
                isActive || isCompleted ? "text-[#EB6081]" : "text-neutral-400",
              )}
            >
              <Link href={step.href} onClick={() => handleStepClick(step.href)} className="flex flex-col items-center min-w-0">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg border-2 transition-colors",
                    "h-12 w-12 max-[576px]:h-10 max-[576px]:w-10 max-[625px]:h-9 max-[625px]:w-9 max-[390px]:h-8 max-[390px]:w-8",
                    isActive || isCompleted
                      ? "border-[#EB6081] bg-[#EB6081]/5"
                      : "border-neutral-300 bg-neutral-50",
                  )}
                >
                  {IconComponent === CheckCircle2 ? (
                    <IconComponent
                      className={cn(
                        "h-8 w-8 max-[576px]:h-6 max-[576px]:w-6 max-[625px]:h-5 max-[625px]:w-5 max-[390px]:h-5 max-[390px]:w-5",
                        isActive || isCompleted ? "text-[#EB6081]" : "text-neutral-400",
                      )}
                    />
                  ) : (
                    <IconComponent
                      className="w-8 h-8 max-[576px]:w-7 max-[576px]:h-7 max-[625px]:w-6 max-[625px]:h-6 max-[390px]:w-6 max-[390px]:h-6 shrink-0"
                      pathClassName={cn(
                        isActive || isCompleted ? "stroke-[#EB6081] fill-none" : "stroke-neutral-400 fill-none",
                      )}
                    />
                  )}
                </div>
                <span className="whitespace-nowrap text-sm max-[576px]:text-xs max-[625px]:text-[11px] max-[390px]:text-[10px] leading-tight text-center truncate max-w-full">
                  {step.label}
                </span>
              </Link>
            </Button>
            {index < STEPS.length - 1 && (
              <div className="flex items-center flex-1 min-w-0 px-2 max-[576px]:px-1 max-[625px]:px-0.5 max-[390px]:px-0 overflow-hidden">
                <div className="flex justify-between w-full gap-px">
                  {[...Array(dotsCount)].map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className={cn(
                        "h-0.5 w-0.5 rounded-full transition-colors flex-shrink-0",
                        shouldColorDots ? "bg-[#EB6081]" : "bg-neutral-300",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
