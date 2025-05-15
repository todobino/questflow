import type { Metadata } from 'next';
import { Outfit } from 'next/font/google'; // Import Outfit
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { ThemeProvider } from 'next-themes';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' }); // Instantiate Outfit

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
      <body className={`${outfit.className} antialiased`}> {/* Apply Outfit className */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
