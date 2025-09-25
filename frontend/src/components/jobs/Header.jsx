'use client';
import { AppBar, Toolbar, Typography, Button, Stack, Container, Box } from '@mui/material'; // Box 추가
import Image from 'next/image'; // next/image 임포트

export function Header() {
  return (
    <AppBar position="sticky" color="background" elevation={1}>
      <Container>
        <Toolbar disableGutters>
          {/* Typography 대신 Image 컴포넌트를 사용 */}
          <Box
            component="a"
            href="/"
            sx={{
              flexGrow: 1,
              display: 'flex', // 이미지 중앙 정렬을 위해 flexbox 사용
              alignItems: 'center',
              textDecoration: 'none',
              height: '40px', // 로고 높이 제한 (필요에 따라 조절)
            }}
          >
            <Image
              src="/logo.png" // public 폴더의 logo.png
              alt="이음 로고" // 접근성을 위한 alt 텍스트
              width={100} // 이미지 너비 (원본 비율에 따라 조절)
              height={100} // 이미지 높이 (원본 비율에 따라 조절)
              priority // LCP(Largest Contentful Paint) 개선을 위해 우선순위 높임
            />
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button href="#" color="inherit">Jobs</Button>
            <Button href="#" color="inherit">Companies</Button>
            <Button href="#" color="inherit">About</Button>
            <Button href="#" variant="contained" color="primary">
              로그인
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}