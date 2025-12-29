import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AuthStatus from "@/components/AuthStatus";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import MenuTabs from "@/components/MenuTabs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoSoup Article Management App",
  description: "A NextJS 15 app for managing users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                      <Link href="/">
                      NoSoup
                      </Link>
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MenuTabs />
                    <Navigation />
                    <AuthStatus />
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
