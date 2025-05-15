import type { Metadata } from 'next';
import { Manrope } from 'next/font/google'; // Import Manrope
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { ThemeProvider } from 'next-themes';

const manrope = Manrope({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Common weights, adjust as needed
  display: 'swap',
  variable: '--font-manrope', 
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
      <body className={`${manrope.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* CampaignProvider will be moved into MainLayout */}
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
