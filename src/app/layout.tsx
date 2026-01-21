import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kunder Food - Discover Your Next Favorite Meal",
  description: "Swipe through delicious dishes and get personalized meal recommendations based on your taste preferences.",
  keywords: ["meal", "food", "recipes", "recommendations", "tinder for food"],
  openGraph: {
    title: "Kunder Food - Discover Your Next Favorite Meal",
    description: "Swipe through delicious dishes and get personalized meal recommendations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
