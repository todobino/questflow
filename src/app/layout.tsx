import type { Metadata } from 'next';
// Removed Outfit import
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { ThemeProvider } from 'next-themes';

// Removed Outfit instantiation

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
      <body className="antialiased"> {/* Removed Outfit className */}
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
