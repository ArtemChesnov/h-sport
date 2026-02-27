"use client";

import { cn } from "@/shared/lib/utils";
import gsap from "gsap";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { Container } from "./layout";
import { PromoCodeModal } from "./promo-code-modal";
import { PromoButton } from "./ui";

interface Props {
  className?: string;
}

export const FirstScreen: React.FC<Props> = ({ className }) => {
  const [promoModalOpen, setPromoModalOpen] = React.useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const el = boxRef.current;
    const title = titleRef.current;
    const desc = descRef.current;
    const cta = ctaRef.current;
    if (!el || !title || !desc || !cta) return;

    gsap.set([title, desc, cta], { opacity: 0, y: 24 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(title, { opacity: 1, y: 0, duration: 0.7 })
      .to(desc, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
      .to(cta, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="relative mx-auto">
      <div className="relative h-screen w-full max-w-[1920px] mx-auto overflow-hidden">
        <Image
          className={cn("w-full h-full object-cover object-[80%_0]", className)}
          alt="first-screen"
          src="/assets/images/banner.webp"
          fill
          priority
          sizes="(max-width: 1920px) 100vw, 1920px"
          quality={85}
        />
      </div>
      <Container>
        <div
          ref={boxRef}
          className="absolute bottom-10 flex flex-col min-[1920px]:gap-8 min-[1440px]:gap-6 min-[1024px]:gap-6 gap-4 items-start min-[1024px]:p-10 p-6 bg-white/50 backdrop-blur-xl rounded-[10px] w-fit"
        >
          <div className="flex flex-col gap-2">
            <h2
              ref={titleRef}
              className="text-primary! leading-[100%] tracking-[-0.06em] min-[1920px]:text-[76px] font-semibold uppercase motion-reduce:opacity-100 min-[1440px]:text-[52px] min-[1024px]:text-[42px] min-[768px]:text-[32px] min-[576px]:text-[22px]  text-[18px] "
            >
              Будь сильной. Будь яркой. Будь собой.
            </h2>
            <h3
              ref={descRef}
              className="min-[1920px]:text-[40px] font-regular min-[1024px]:tracking-[-0.01em] leading-[110%] uppercase motion-reduce:opacity-100 min-[1440px]:text-[26px] min-[1024px]:text-[22px] text-[14px] tracking-[-0.03em] w-[322px] min-[768px]:text-[17px] min-[576px]:text-[16px] min-[576px]:w-[370px] min-[768px]:w-[518px] min-[1024px]:w-[700px] min-[1440px]:w-[836px] min-[1920px]:w-[1288px]"
            >
              Твоя тренировка — твои правила. Подчеркни свою силу и женственность в спортивной
              одежде, созданной для движения и вдохновения.
            </h3>
          </div>
          <div ref={ctaRef} className="motion-reduce:opacity-100">
            <PromoButton
              className="min-[1440px]:text-[16px] rounded-[10px]  min-[1920px]:text-[24px]!"
              _variant="outline"
              text="Промокод на первый заказ"
              onClick={() => setPromoModalOpen(true)}
            />
          </div>
        </div>
      </Container>
      <PromoCodeModal open={promoModalOpen} onOpenChange={setPromoModalOpen} />
    </div>
  );
};
