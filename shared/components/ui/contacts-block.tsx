import { MailIcon, PhoneIcon, TelegramIcon, VkIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import React from "react";
import { DesignButton } from "./design-button";

const PHONE_DISPLAY = "+7 910 146 25 17";
const PHONE_HREF = "tel:+79101462517";

interface Props {
  className?: string;
  /** Размер иконок в пикселях (по умолчанию 40). Для бургер-меню на мобилках — 24. */
  iconSize?: number;
  /** Только иконки, без текстовой ссылки с телефоном (для компактного блока в меню). */
  iconsOnly?: boolean;
}
interface SocialLink {
  alt: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const ContactsBlock: React.FC<Props> = ({ className, iconSize = 40, iconsOnly = false }) => {
  const socialLinks: SocialLink[] = [
    {
      alt: "Мы ВКонтакте",
      Icon: VkIcon,
      href: "https://vk.com/club228023323",
    },
    {
      alt: "Мы в Telegram",
      Icon: TelegramIcon,
      href: "https://t.me/h_sportbrand",
    },
    {
      alt: "Наша почта",
      Icon: MailIcon,
      href: "mailto:h.sportbrand@yandex.ru",
    },
    {
      alt: "Наш номер телефона",
      Icon: PhoneIcon,
      href: PHONE_HREF,
    },
  ];

  const phoneLinkClass =
    "leading-[120%] text-[16px] min-[577px]:text-[20px] hover:text-primary transition-colors";

  const iconClass = "overflow-visible fill-black transition-colors group-hover:fill-[#EB6081]";

  return (
    <div className={cn("flex flex-col gap-4 max-[1024px]:gap-3", className)}>
      <h3 className="text-[20px] min-[577px]:text-[26px] leading-[120%] font-light">
        СВЯЖИТЕСЬ С НАМИ
      </h3>
      <div className="flex items-center gap-2">
        {socialLinks.map(({ alt, Icon, href }) => (
          <DesignButton
            key={alt}
            asChild
            variant="ghost"
            size="icon"
            className="group hover:bg-transparent transition-transform hover:scale-110"
          >
            <Link href={href} aria-label={alt}>
              <Icon
                className={cn(iconClass)}
                style={{
                  width: iconSize,
                  height: iconSize,
                  minWidth: iconSize,
                  minHeight: iconSize,
                }}
              />
            </Link>
          </DesignButton>
        ))}
      </div>

      {!iconsOnly && (
        <Link
          href={PHONE_HREF}
          className={cn(
            "inline-flex text-[16px] min-[577px]:text-[20px] font-light transition-colors font-sans",
            phoneLinkClass
          )}
        >
          <span className={"hover:text-[#EB6081]"}>{PHONE_DISPLAY}</span>
        </Link>
      )}
    </div>
  );
};
