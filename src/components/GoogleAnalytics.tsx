// components/GoogleAnalytics.js
import Script from 'next/script';
import SettingComponent from "./Setting";
import { Setting } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function GoogleAnalytics() {
  const session = await getServerSession(authOptions)

  let analyticsId: string | null | undefined = null;

  try {
    const settings = await prisma.setting.findUnique({where: {key: 'google_analytics'}});
    analyticsId = settings?.value;

  } catch (error) {
    // console.log(error);
  }

  return (
    <>
      { session?.user && !!session?.user.role && session?.user.role === 'admin' && (<>
        Edit Google Analitics
        <SettingComponent setting="google_analytics" type="text">
          id
        </SettingComponent>
      </>)}

      {analyticsId && (<>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${analyticsId}');
          `}
        </Script>
      </>)}
    </>
  );
}