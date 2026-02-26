import { MailIcon, PhoneIcon, TelegramIcon, VkIcon, WhatsAppIcon } from "@/shared/components/icons";
import { cn } from "@/shared/lib";
import Link from "next/link";
import React from "react";
import { DesignButton } from "./design-button";

interface Props {
  className?: string;
}
interface SocialLink {
  alt: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const ContactsBlock: React.FC<Props> = ({ className }) => {
  const socialLinks: SocialLink[] = [
    {
      alt: "Мы ВКонтакте",
      Icon: VkIcon,
      href: "https://vk.com/...",
    },
    {
      alt: "Мы в Telegram",
      Icon: TelegramIcon,
      href: "https://t.me/...",
    },
    {
      alt: "Наша почта",
      Icon: MailIcon,
      href: "https://wa.me/...",
    },

    {
      alt: "Мы в WhatsApp",
      Icon: WhatsAppIcon,
      href: "https://wa.me/...",
    },
    {
      alt: "Наш номер телефона",
      Icon: PhoneIcon,
      href: "https://wa.me/...",
    },
  ];

  const phoneLinkClass = "leading-[120%] text-[19px] hover:text-primary transition-colors";

  return (
    <div className={"flex flex-col gap-4 max-[1024px]:gap-3"}>
      <h3 className="text-[26px] leading-[120%] font-light max-[1280px]:text-[24px]">
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
              <Icon className="w-10 h-10 overflow-visible fill-black transition-colors group-hover:fill-[#EB6081]" />
            </Link>
          </DesignButton>
        ))}
      </div>

      <Link
        href="tel:8 800 000 00 00"
        className={cn(
          "inline-flex text-[22px] font-light transition-colors font-sans",
          phoneLinkClass
        )}
      >
        <span className={"hover:text-[#EB6081]"}>8 800 000 00 00</span>
      </Link>
    </div>
  );
};
