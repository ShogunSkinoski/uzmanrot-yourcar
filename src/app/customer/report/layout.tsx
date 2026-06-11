import type { Metadata } from "next";

// The report page (src/app/customer/report/page.tsx) is a client component and
// can't export metadata itself. This server layout marks the route noindex so a
// customer's plate + measurement data never gets indexed or shows in search.
export const metadata: Metadata = {
  title: "Ölçüm Raporu",
  robots: { index: false, follow: false },
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
