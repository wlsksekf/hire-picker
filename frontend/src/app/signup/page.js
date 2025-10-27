'use client';

import React from 'react';
import { Container, Typography, Grid, Card, CardActionArea, CardContent, Box } from '@mui/material';
import Link from 'next/link';

export default function SignupChoicePage() {
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          회원가입
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
          가입 유형을 선택해주세요.
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* 개인 회원가입 카드 */}
          <Grid item xs={12} sm={6} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} href="/signup/personal" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" align="center">
                    개인 회원
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    새로운 기회를 찾고 계신가요?<br />
                    이력서를 등록하고 맞춤 채용 정보를 받아보세요.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* 기업 회원가입 카드 */}
          <Grid item xs={12} sm={6} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} href="/signup/company" sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" align="center">
                    기업 회원
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    최고의 인재를 찾고 계신가요?<br />
                    채용 공고를 등록하고 지원자를 관리하세요.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}