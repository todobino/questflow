import type { Metadata } from 'next';
// Removed Manrope import
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { ThemeProvider } from 'next-themes';

// Removed manrope constant

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
      {/* Removed manrope.className and manrope.variable */}
      <body className="antialiased">
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
