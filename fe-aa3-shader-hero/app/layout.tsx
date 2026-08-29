import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kajal Bhatiya — Frontend AI Engineer",
  description:
    "An interactive ink-shader hero: a domain-warped WebGL fragment shader that bends toward the cursor like a ferrofluid.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
