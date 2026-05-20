import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import OpeningAnimation from "@/components/layout/OpeningAnimation";

export const metadata: Metadata = {
  title: "PhotoFly - AI Photo Recognition for Events",
  description: "Upload your selfie and instantly find all your photos from any event using AI face recognition.",
  keywords: "photo recognition, face recognition, event photos, AI photos",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="antialiased text-slate-800" style={{ background: "#FAFBFC", color: "#334155" }}>
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
      </body>
    </html>
  );
}
