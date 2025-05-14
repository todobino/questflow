import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google'; // Import DM_Sans
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { CampaignProvider } from '@/contexts/campaign-context';

const dmSans = DM_Sans({ // Changed from manrope to dmSans
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Adjusted weights for DM Sans
  display: 'swap',
  variable: '--font-dm-sans', // Optional: if you want to use it as a CSS variable
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
      <body className={`${dmSans.className} antialiased`}> {/* Apply DM_Sans className */}
        <CampaignProvider>
          <MainLayout>{children}</MainLayout>
        </CampaignProvider>
      </body>
    </html>
  );
}
