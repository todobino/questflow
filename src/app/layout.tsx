import type { Metadata } from 'next';
import { Manrope } from 'next/font/google'; // Import Manrope
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { CampaignProvider } from '@/contexts/campaign-context';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Include necessary weights, adjust as needed
  display: 'swap',
  variable: '--font-manrope', // Optional: if you want to use it as a CSS variable
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
      <body className={`${manrope.className} antialiased`}> {/* Apply Manrope className */}
        <CampaignProvider>
          <MainLayout>{children}</MainLayout>
        </CampaignProvider>
      </body>
    </html>
  );
}
