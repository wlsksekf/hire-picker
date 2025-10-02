
import ThemeRegistry from '../components/ThemeRegistry';
import { Analytics } from '@vercel/analytics/react';
import { Box, Container } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
              {children}
            </Container>
            <Footer />
          </Box>
        </ThemeRegistry>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
