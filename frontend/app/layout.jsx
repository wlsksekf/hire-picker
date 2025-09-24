import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/theme'; // 1번에서 만든 테마 파일
import "./globals.css";

export const metadata = {
  title: "JobSearch - Find Your Dream Job",
  description: "Modern job search platform with clean, minimalist design",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Analytics />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}