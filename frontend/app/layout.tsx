import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import OpeningAnimation from "@/components/layout/OpeningAnimation";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: "PhotoFly - AI Photo Recognition for Events",
  description: "Upload your selfie and instantly find all your photos from any event using AI face recognition.",
  keywords: "photo recognition, face recognition, event photos, AI photos",
  icons: { icon: "/camera-icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`light ${inter.variable}`} style={{ colorScheme: "light" }}>
      <body className={`${inter.className} antialiased text-slate-800`} style={{ background: "#FAFBFC", color: "#334155" }}>
        <OpeningAnimation />
        <NavbarWrapper />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#334155",
              border: "1px solid rgba(255,45,120,0.2)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(255,45,120,0.12)",
            },
          }}
        />

        {/* Tawk.to live chat — loads after page is interactive */}
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/6a3816ff0f2eba1d56794dbe/1jrlhjmjh';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
