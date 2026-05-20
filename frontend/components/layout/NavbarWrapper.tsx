"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Routes where the Navbar should NOT appear
const HIDDEN_PREFIXES = ["/dashboard", "/admin"];

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;
  return <Navbar />;
}
