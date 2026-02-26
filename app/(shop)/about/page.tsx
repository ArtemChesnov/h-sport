import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo/seo";
import dynamic from "next/dynamic";

const AboutPageClient = dynamic(
  () => import("./about-page-client").then((m) => ({ default: m.AboutPageClient })),
);

export const metadata = generateSEOMetadata({
  title: "О нас",
  description:
    "H-Sport — больше, чем просто спортивная одежда. Мы создаём одежду для движения, силы и уверенности.",
  url: "/about",
});

export default function AboutPage() {
  return <AboutPageClient />;
}
