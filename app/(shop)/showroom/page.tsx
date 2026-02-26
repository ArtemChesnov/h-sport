import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo/seo";
import Image from "next/image";

export const metadata = generateSEOMetadata({
  title: "Шоурум",
  description:
    "Приглашаем вас в наш фирменный шоурум спортивной одежды H-Sport в самом центре Нижнего Новгорода!",
  url: "/showroom",
});

export default function ShowroomPage() {
  return (
    <>
      <Container>
        <ShopBreadcrumbs customLastLabel="Шоурум" />
        <h1
          className={
            "text-primary! uppercase leading-[120%] w-full max-[576px]:text-[20px] max-[576px]:mt-6 min-[577px]:text-[20px] min-[577px]:mt-10 min-[768px]:text-[28px] min-[1024px]:text-[38px] min-[1280px]:text-[48px] min-[1440px]:text-[56px] min-[1920px]:text-[74px] min-[1920px]:mt-15"
          }
        >
          <span className="min-[577px]:block">
            Приглашаем вас в наш фирменный шоурум спортивной
          </span>
          <span className="min-[577px]:block">
            одежды H-Sport в самом центре Нижнего Новгорода!
          </span>
        </h1>

        {/* До 1440px: порядок — два малых фото → большое фото → текст. С 1440px — две колонки, отступы 20px. Ниже 1440 — 10px. */}
        <div className="flex flex-col gap-2.5 mt-10.5 max-[1440px]:mt-6 min-[1440px]:flex-row min-[1440px]:gap-5 min-[1440px]:items-stretch min-[1440px]:h-fit">
          {/* Левая колонка: с 1440px flex-1, ниже — колонка сверху вниз */}
          <div className="flex flex-col justify-between min-[1440px]:flex-1 min-[1440px]:min-w-0 gap-2.5 min-[1440px]:gap-5">
            <div className="flex flex-col gap-2.5 min-[1440px]:gap-5">
              <div
                className={
                  "flex gap-2.5 min-[1440px]:gap-5 h-full max-[1439px]:max-h-none max-[1439px]:grid max-[1439px]:grid-cols-2 min-[1440px]:max-h-125"
                }
              >
                <Image
                  src={"/assets/images/showroom/showroom_1.png"}
                  alt={"Шоурум"}
                  width={450}
                  height={500}
                  className="max-[1439px]:w-full max-[1439px]:h-auto max-[1439px]:object-cover min-[1440px]:min-w-0 min-[1440px]:w-full min-[1440px]:h-auto min-[1440px]:object-cover"
                />
                <Image
                  src={"/assets/images/showroom/showroom_2.png"}
                  alt={"Шоурум"}
                  width={450}
                  height={500}
                  className="max-[1439px]:w-full max-[1439px]:h-auto max-[1439px]:object-cover min-[1440px]:min-w-0 min-[1440px]:w-full min-[1440px]:h-auto min-[1440px]:object-cover"
                />
              </div>
            </div>
            {/* Большое фото: показывается между двумя малыми и текстом ниже 1440px, с 1440px скрыто */}
            <div className="relative w-full max-[1439px]:aspect-[4/3] max-[1439px]:overflow-hidden min-[1440px]:hidden">
              <Image
                src={"/assets/images/showroom/showroom_3.png"}
                alt={"Шоурум"}
                fill
                sizes="(max-width: 1439px) 100vw, 0"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-between h-full gap-8 min-[1440px]:gap-8">
              <div className="flex flex-col gap-4 min-[1440px]:gap-4">
                <h3 className="text-[32px] leading-[130%] font-normal text-primary! max-[576px]:text-[24px] max-[1440px]:pt-4">
                  Почему стоит заглянуть в шоурум?
                </h3>
                <ul className="flex flex-col gap-2 min-[1440px]:gap-2 list-none">
                  <li className="flex items-start gap-3 text-[22px] font-normal leading-[130%] max-[576px]:text-base">
                    <span
                      className="mt-2.5 h-3 w-3 shrink-0 rounded-full bg-[#EB6081] max-[576px]:mt-2 max-[576px]:h-2.5 max-[576px]:w-2.5"
                      aria-hidden
                    />
                    примерить актуальные коллекции спортивной одежды и обуви;
                  </li>
                  <li className="flex items-start gap-3 text-[22px] font-normal leading-[130%] max-[576px]:text-base">
                    <span
                      className="mt-2.5 h-3 w-3 shrink-0 rounded-full bg-[#EB6081] max-[576px]:mt-2 max-[576px]:h-2.5 max-[576px]:w-2.5"
                      aria-hidden
                    />
                    подобрать экипировку для тренировок, бега, фитнеса и активного отдыха;
                  </li>
                  <li className="flex items-start gap-3 text-[22px] font-normal leading-[130%] max-[576px]:text-base">
                    <span
                      className="mt-2.5 h-3 w-3 shrink-0 rounded-full bg-[#EB6081] max-[576px]:mt-2 max-[576px]:h-2.5 max-[576px]:w-2.5"
                      aria-hidden
                    />
                    получить консультацию от специалистов и помощь в выборе моделей и размеров;
                  </li>
                  <li className="flex items-start gap-3 text-[22px] font-normal leading-[130%] max-[576px]:text-base">
                    <span
                      className="mt-2.5 h-3 w-3 shrink-0 rounded-full bg-[#EB6081] max-[576px]:mt-2 max-[576px]:h-2.5 max-[576px]:w-2.5"
                      aria-hidden
                    />
                    оформить заказ с сайта и забрать его самостоятельно без ожидания доставки.
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 min-[1440px]:gap-2">
                <p className="text-[22px] leading-[130%] font-normal max-[576px]:text-base">
                  Адрес и график работы:
                </p>
                <p className="text-[22px] leading-[130%] font-normal max-[576px]:text-base">
                  📍 Нижний Новгород, ул. Минина, 16а
                </p>
                <p className="text-[22px] leading-[130%] font-normal max-[576px]:text-base">
                  🕒 Ежедневно с 11:00 до 19:00
                </p>
              </div>
            </div>
          </div>

          {/* Правая колонка: большое фото той же высоты, что и левый блок; только с 1440px */}
          <div className="max-[1439px]:hidden min-[1440px]:block min-[1440px]:flex-1 min-[1440px]:min-w-0 min-[1440px]:min-h-0 relative">
            <Image
              src={"/assets/images/showroom/showroom_3.png"}
              alt={"Шоурум"}
              fill
              sizes="(min-width: 1440px) 50vw, 0"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </>
  );
}
