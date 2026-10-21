import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import NavbarWrapper from "./components/navbar-wrapper";

export const metadata: Metadata = {
  title: {
    default: "Quizify",
    template: "%s | Quizify",
  },
  description:
    "Challenge your mind, create quizzes, and compete in our interactive learning platform.",
};

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${figtree.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <NavbarWrapper>{children}</NavbarWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
