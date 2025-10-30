import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { TenantProvider } from "@/providers/tenant-provider";
import { TenantAuthProvider } from "@/providers/tenant-auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { AuthTokenManager } from "@/components/auth/AuthTokenManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WorkZone.tech - AI-Powered HR Management Platform",
    template: "%s | WorkZone.tech",
  },
  description:
    "Next-generation HR Management Platform powered by GenAI. Automate recruitment, performance management, leave tracking, and compliance for startups and mid-sized enterprises.",
  keywords: [
    "HR Management",
    "HRMS",
    "HRM Software",
    "AI Recruitment",
    "Employee Management",
    "Performance Management",
    "Leave Management",
    "Payroll",
    "HR Analytics",
    "WorkZone",
  ],
  authors: [{ name: "WorkZone.tech Team" }],
  creator: "WorkZone.tech",
  publisher: "WorkZone.tech",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://workzone.tech"
  ),
  openGraph: {
    title: "WorkZone.tech - AI-Powered HR Management Platform",
    description:
      "Streamline your HR operations with intelligent automation, bias-free recruitment, and data-driven insights.",
    url: "https://workzone.tech",
    siteName: "WorkZone.tech",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkZone.tech - AI-Powered HR Management Platform",
    description:
      "Next-generation HR Management Platform for startups and enterprises.",
    creator: "@workzonetech",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          // enableSystem
          // disableTransitionOnChange
        >
          <ToastProvider>
            {/* Platform Auth Provider - for company/client authentication */}
            <AuthProvider>
              <AuthTokenManager />

              {/* Tenant Providers - for subdomain-based tenant features */}
              <TenantProvider>
                <TenantAuthProvider>{children}</TenantAuthProvider>
              </TenantProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
