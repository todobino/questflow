import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google'; // Import DM_Sans
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { CampaignProvider } from '@/contexts/campaign-context';
import { ThemeProvider } from 'next-themes';

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'], 
  display: 'swap',
  variable: '--font-dm-sans', 
});

export const metadata: Metadata = {
  title: 'QuestFlow',
  description: 'Your ultimate RPG campaign management tool, powered by Firebase Studio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CampaignProvider>
            <MainLayout>{children}</MainLayout>
          </CampaignProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
