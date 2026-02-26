import dynamic from "next/dynamic";
import { CertificatePageSkeleton } from "./_components/certificate-page-skeleton";

const CertificatePageClient = dynamic(
  () =>
    import("./_components/certificate-page-client").then((m) => ({
      default: m.CertificatePageClient,
    })),
  { loading: () => <CertificatePageSkeleton /> },
);

export default function CertificatePage() {
  return <CertificatePageClient />;
}
