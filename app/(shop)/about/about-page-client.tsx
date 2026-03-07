"use client";

import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function AboutPageClient() {
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const block2Ref = useRef<HTMLParagraphElement>(null);
  const block3Ref = useRef<HTMLParagraphElement>(null);
  const phrase1Ref = useRef<HTMLHeadingElement>(null);
  const phrase2Ref = useRef<HTMLHeadingElement>(null);
  const phrase3Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Появление при загрузке: видео и главный заголовок
      gsap.fromTo(
        videoWrapRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: "power3.out" }
      );

      // Появление при скролле
      const scrollTargets = [
        { ref: introRef, delay: 0 },
        { ref: block2Ref, delay: 0.1 },
        { ref: block3Ref, delay: 0.2 },
        { ref: phrase1Ref, delay: 0 },
        { ref: phrase2Ref, delay: 0.15 },
        { ref: phrase3Ref, delay: 0.3 },
      ];

      scrollTargets.forEach(({ ref, delay }) => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 56 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              end: "top 50%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="shop">
      <Container className="pt-10 pb-2">
        <ShopBreadcrumbs customLastLabel="О нас" />
      </Container>
      <div ref={videoWrapRef} className="mx-auto w-full mt-15">
        <div
          className="aspect-video w-full overflow-hidden  bg-neutral-200 mx-auto max-w-480"
          aria-label="Видео о бренде"
        >
          <video
            src="/video/about.mov"
            className="h-full w-full object-cover"
            playsInline
            muted
            loop
            autoPlay
            controls
          />
        </div>
      </div>
      <Container>
        <div className="flex w-full justify-center">
          <h2
            ref={titleRef}
            className="text-primary! text-center font-normal leading-[120%] uppercase mt-12 max-[576px]:mt-8 max-[576px]:text-[24px] min-[577px]:text-[36px] min-[768px]:text-[48px] min-[1024px]:text-[64px] min-[1280px]:text-[80px] min-[1920px]:mt-25 min-[1920px]:text-[100px]"
          >
            H sport — это больше,
            <br /> чем просто спортивная одежда.
          </h2>
        </div>

        <div className="mt-10 max-[576px]:mt-8 min-[577px]:mt-12 min-[768px]:mt-16 min-[1920px]:mt-20 space-y-6 max-[576px]:space-y-4 min-[577px]:space-y-5 min-[1024px]:space-y-6 min-[1920px]:space-y-8 text-text-primary">
          <p
            ref={introRef}
            className="max-[576px]:w-full max-[576px]:max-w-full min-[577px]:mx-auto min-[577px]:max-w-[400px] min-[768px]:max-w-[520px] min-[1024px]:max-w-[620px] min-[1280px]:max-w-[700px] min-[1920px]:max-w-[790px] text-[16px] max-[576px]:text-[14px] min-[577px]:text-[18px] min-[768px]:text-[22px] min-[1920px]:text-[26px] leading-[130%]"
          >
            Мы создаём стиль, который двигается вместе с тобой.
            <br />
            Наш бренд родился из любви к активной жизни и стремления объединить эстетику, комфорт и
            свободу движения.
          </p>
          <p
            ref={block2Ref}
            className="max-[576px]:w-full max-[576px]:max-w-full max-[576px]:ml-0 min-[577px]:ml-8 min-[768px]:ml-16 min-[1024px]:ml-24 min-[1920px]:ml-40 min-[577px]:max-w-[400px] min-[768px]:max-w-[520px] min-[1024px]:max-w-[620px] min-[1280px]:max-w-[700px] min-[1920px]:max-w-[790px] text-[16px] max-[576px]:text-[14px] min-[577px]:text-[18px] min-[768px]:text-[22px] min-[1920px]:text-[26px] leading-[130%]"
          >
            Каждая вещь H sport — это результат точного баланса между трендом и функциональностью:
            от зала до улиц, от утренней пробежки до вечернего расслабления.
          </p>
          <p
            ref={block3Ref}
            className="max-[576px]:w-full max-[576px]:max-w-full max-[576px]:ml-0 min-[577px]:ml-12 min-[768px]:ml-24 min-[1024px]:ml-40 min-[1280px]:ml-100 min-[1920px]:ml-158.75 min-[577px]:max-w-[400px] min-[768px]:max-w-[520px] min-[1024px]:max-w-[620px] min-[1280px]:max-w-[700px] min-[1920px]:max-w-[790px] text-[16px] max-[576px]:text-[14px] min-[577px]:text-[18px] min-[768px]:text-[22px] min-[1920px]:text-[26px] leading-[130%]"
          >
            Мы верим, что спорт — это не про идеал, а про силу быть собой
          </p>
        </div>

        <div className="mt-10 max-[576px]:mt-8 min-[577px]:mt-12 min-[768px]:mt-16 min-[1920px]:mt-20 flex w-full flex-col justify-center gap-6 max-[576px]:gap-4 min-[577px]:gap-5 min-[1920px]:gap-10.5 ">
          <h3
            ref={phrase1Ref}
            className="text-primary! text-center font-normal leading-[120%] uppercase text-[32px] max-[576px]:text-[24px] min-[577px]:text-[40px] min-[768px]:text-[56px] min-[1024px]:text-[72px] min-[1920px]:text-[100px]"
          >
            Ты задаёшь ритм.
          </h3>
          <h3
            ref={phrase2Ref}
            className="text-primary! text-center font-normal leading-[120%] uppercase text-[32px] max-[576px]:text-[24px] min-[577px]:text-[40px] min-[768px]:text-[56px] min-[1024px]:text-[72px] min-[1920px]:text-[100px]"
          >
            Ты выбираешь стиль.
          </h3>
          <h3
            ref={phrase3Ref}
            className="text-primary! text-center font-normal leading-[120%] uppercase text-[32px] max-[576px]:text-[24px] min-[577px]:text-[40px] min-[768px]:text-[56px] min-[1024px]:text-[72px] min-[1920px]:text-[100px]"
          >
            Будь сильной. Будь яркой. Будь собой.
          </h3>
        </div>
      </Container>
    </div>
  );
}
