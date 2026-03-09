"use client";

import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function CertificatePageClient() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const els = [h1Ref.current, pRef.current, h2Ref.current].filter(Boolean);
    gsap.set(els, { opacity: 0, y: 24 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
    });

    const imgs = imageRefs.current.filter(Boolean);
    if (imgs.length > 0) {
      gsap.set(imgs, { opacity: 0, y: 20 });
      imgs.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.4 + i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });
    }

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <>
      <Container>
        <ShopBreadcrumbs customLastLabel="Подарочный сертификат" />
        <div
          className={
            "flex flex-col items-center " +
            "gap-4 mt-6 min-[576px]:gap-5 min-[576px]:mt-8 min-[768px]:gap-6 min-[768px]:mt-10 min-[1024px]:mt-12 min-[1280px]:mt-15"
          }
        >
          <h1
            ref={h1Ref}
            className={
              "text-center text-primary! uppercase leading-[120%] w-full motion-reduce:opacity-100 " +
              "text-[20px] min-[768px]:text-[28px] min-[1024px]:text-[38px] min-[1280px]:text-[48px] min-[1440px]:text-[56px] min-[1920px]:text-[86px]"
            }
          >
            Идеальный подарок для тех, кто живет спортом!
          </h1>
          <p
            ref={pRef}
            className={
              "text-center font-normal leading-[130%] w-full motion-reduce:opacity-100 " +
              "text-[14px] min-[576px]:text-base min-[768px]:text-[18px] min-[1024px]:text-[20px] min-[1280px]:text-[22px] min-[1440px]:text-[24px] " +
              "min-[1440px]:max-w-[1000px] min-[1600px]:max-w-[1600px] "
            }
          >
            Сертификат H-Sport — это свобода выбора качественной спортивной одежды, обуви и
            аксессуаров. Позвольте близким выбрать именно то, что им нужно для тренировок, активного
            отдыха или повседневного стиля.
          </p>
        </div>
        <h2
          ref={h2Ref}
          className={
            "text-center font-normal uppercase leading-[130%] motion-reduce:opacity-100 " +
            "mt-4 min-[576px]:mt-6 min-[768px]:mt-10 min-[1024px]:mt-16 min-[1280px]:mt-20 min-[1920px]:mt-24 " +
            "text-[14px] min-[576px]:text-[16px] min-[768px]:text-[20px] min-[1024px]:text-[26px] min-[1280px]:text-[34px] min-[1440px]:text-[40px] min-[1920px]:text-[60px]"
          }
        >
          Выберите номинал сертификата и оформите покупку прямо сейчас!
        </h2>
        <div
          ref={imagesRef}
          className={
            "grid grid-cols-2 gap-2.5 min-[769px]:gap-5 w-full " +
            "mt-4 min-[576px]:mt-6 min-[768px]:mt-8 "
          }
        >
          {["certificate_1", "certificate_2", "certificate_3", "certificate_4"].map((name, i) => (
            <div
              key={name}
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              className={
                "relative w-full overflow-hidden motion-reduce:opacity-100 " +
                "h-[265px] min-[576px]:h-[390px] min-[768px]:h-[530px] min-[1024px]:h-[700px] min-[1280px]:h-[880px] min-[1440px]:h-[1000px] min-[1920px]:h-[1360px]"
              }
            >
              <Image
                src={`/assets/images/certificate/${name}.webp`}
                alt={`Сертификат ${i + 1}`}
                fill
                className="object-cover"
                sizes="50vw"
                priority={name === "certificate_1"}
              />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
