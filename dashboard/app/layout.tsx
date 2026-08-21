import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aimee Bernard — Content",
  description: "Upload and categorize content.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
