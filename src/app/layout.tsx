import type { Metadata } from 'next';
// Removed Geist font imports
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { CampaignProvider } from '@/contexts/campaign-context';

// Removed geistSans and geistMono constants

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
      {/* Removed font variables from className */}
      <body className="antialiased">
        <CampaignProvider>
          <MainLayout>{children}</MainLayout>
        </CampaignProvider>
      </body>
    </html>
  );
}
