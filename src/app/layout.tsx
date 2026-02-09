import { Mulish } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Providers from "@/components/Providers";
import AuthStatus from "@/components/AuthStatus";
import Navigation from "@/components/Navigation";
import MenuTabs from "@/components/MenuTabs";
import SiteName from "@/components/SiteName";
import Search from "@/components/Search";
import Footer from "@/components/Footer";
import Setting from "@/components/Setting";
const mulish = Mulish({ subsets: ["latin"] });
import type { Viewport } from 'next'

export async function generateMetadata() {
  return {
    icons: {
      icon: [
        { url: `/files/favicon.png` },
        { url: `favicon.ico` },
      ],
    },
  };
}
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximumScale: 1,
  // userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={mulish.className} suppressHydrationWarning={true}>
        <Providers>
            <div className={styles["layout__container"]}>
              <nav className={styles["layout__nav"]}>
                <div className={styles["layout__nav-inner"]}>
                <div className={styles["layout__nav-row"]}>
                    <div className={styles["layout__brand"]}>
                      <h1 className={styles["layout__site-name"]}>
                      <SiteName />
                    </h1>
                  </div>
                  <div className={styles["layout__controls"]}>
                    <MenuTabs />
                    <Navigation />
                    <AuthStatus />
                    <Setting title="Show Search" setting="show_search_bar" type="show">
                      <Search />
                    </Setting>
                  </div>
                </div>
              </div>
            </nav>
            <main className={styles["layout__main"]}>
              {children}
            </main>
          <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
