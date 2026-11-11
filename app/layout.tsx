import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ShopBangla — Online Store",
  description: "ShopBangla online shopping",
  manifest: "/manifest.webmanifest",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}
