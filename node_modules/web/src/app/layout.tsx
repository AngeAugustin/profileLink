import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const jakarta = localFont({
  src: [
    {
      path: "../fonts/plus-jakarta-sans/PlusJakartaSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/plus-jakarta-sans/PlusJakartaSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/plus-jakarta-sans/PlusJakartaSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/plus-jakarta-sans/PlusJakartaSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/plus-jakarta-sans/PlusJakartaSans-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

const sora = localFont({
  src: [
    {
      path: "../fonts/sora/Sora-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/sora/Sora-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/sora/Sora-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/sora/Sora-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/sora/Sora-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sora",
  display: "swap",
});

const jetbrains = localFont({
  src: [
    {
      path: "../fonts/jetbrains-mono/JetBrainsMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ProfileLink",
    template: "%s · ProfileLink",
  },
  description:
    "Create your professional profile, get a unique link and a QR code.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${jakarta.variable} ${sora.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
