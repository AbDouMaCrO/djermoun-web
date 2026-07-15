import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ExchangeRateBanner from "@/components/exchange-rate-banner";
import CountryModal from "@/components/country-modal";
import { LanguageProvider } from "@/i18n/language-context";
import { ExchangeRateProvider } from "@/currency/exchange-rate-context";
import { CountryProvider } from "@/country/country-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Djermoun Auto — Direct Access to Premium Vehicles",
  description: "Transparent pricing, complete inspections, and seamless global shipping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <LanguageProvider>
          <ExchangeRateProvider>
            <CountryProvider>
              <CountryModal />
              <ExchangeRateBanner />
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </CountryProvider>
          </ExchangeRateProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
