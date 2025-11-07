import { ApplicantPortalLayout } from "@/components/tenant/applicant-portal-layout";

export default function ApplicantPortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicantPortalLayout>{children}</ApplicantPortalLayout>;
}
