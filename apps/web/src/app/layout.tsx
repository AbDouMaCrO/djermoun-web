import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ExchangeRateBanner from "@/components/exchange-rate-banner";
import CountryModal from "@/components/country-modal";
import { LanguageProvider } from "@/i18n/language-context";
import { ExchangeRateProvider } from "@/currency/exchange-rate-context";
import { CountryProvider } from "@/country/country-context";
import { ThemeProvider } from "@/context/theme-provider";
import type { Country } from "@/country/country-config";
import { getSiteSettings } from "@/app/actions/settings";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  const enabledCountries: Country[] = [];
  if (settings.country_algeria_enabled) enabledCountries.push("algeria");
  if (settings.country_international_enabled) enabledCountries.push("international");
  if (settings.country_uae_enabled) enabledCountries.push("uae");
  if (enabledCountries.length === 0) enabledCountries.push("algeria");

  return (
    <html suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('djermoun-theme');if(t==='dark'){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <ExchangeRateProvider defaultRate={settings.usd_to_dzd_rate}>
              <CountryProvider enabledCountries={enabledCountries}>
                <CountryModal />
                <ExchangeRateBanner />
                <Navbar />
                <div className="flex-1">{children}</div>
                <Footer />
              </CountryProvider>
            </ExchangeRateProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
