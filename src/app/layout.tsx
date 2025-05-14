import type { Metadata } from 'next';
import { Crimson_Text } from 'next/font/google'; // Import Crimson_Text
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { CampaignProvider } from '@/contexts/campaign-context';

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Include necessary weights
  display: 'swap',
  variable: '--font-crimson-text', // Optional: if you want to use it as a CSS variable
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
      <body className={`${crimsonText.className} antialiased`}> {/* Apply Crimson_Text className */}
        <CampaignProvider>
          <MainLayout>{children}</MainLayout>
        </CampaignProvider>
      </body>
    </html>
  );
}
