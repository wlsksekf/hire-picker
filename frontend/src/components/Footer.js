'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Divider,
  Link as MuiLink,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  Business
} from '@mui/icons-material';

// 웹사이트의 푸터 컴포넌트
function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerSections = [
    {
      title: '서비스',
      links: [
        { text: '채용행사', path: '/events' },
        { text: '공채기업정보', path: '/companies' },
        { text: '채용정보', path: '/postings' },
        { text: '신입·인턴', path: '/intern' },
        { text: '취업전략', path: '/strategy' },
        { text: '커뮤니티', path: '/community' },
      ]
    },
    {
      title: '고객지원',
      links: [
        { text: '고객센터', path: '/support' },
        { text: '자주 묻는 질문', path: '/support' },
        { text: '1:1 문의', path: '/support/inquiries/new' },
        { text: '공지사항', path: '/support' },
      ]
    },
    {
      title: '회사정보',
      links: [
        { text: '회사소개', path: '/support' },
        { text: '이용약관', path: '/support' },
        { text: '개인정보처리방침', path: '/support' },
        { text: '채용안내', path: '/support' },
      ]
    }
  ];

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        backgroundColor: '#f5f5f7',
        color: '#212121',
        pt: { xs: 3, md: 4 },
        pb: { xs: 3, md: 3 },
        borderTop: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <Container maxWidth="lg">
        {/* 메인 푸터 콘텐츠 */}
        <Grid container spacing={isMobile ? 3 : 4} sx={{ mb: 3 }}>
          {/* 회사 소개 섹션 */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                component="img"
                src="/hirepicker_logo.png"
                alt="HirePicker Logo"
                sx={{ width: 40, height: 40, marginRight: '12px' }}
              />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#212121' }}>
                HirePicker
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#616161', mb: 2, lineHeight: 1.6 }}>
              취업의 모든 것을 한 곳에서.<br />
              최신 채용정보와 기업 정보를 제공하는<br />
              통합 취업 플랫폼입니다.
            </Typography>
            {/* 소셜 미디어 링크 */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              {socialLinks.map((social, index) => (
                <MuiLink
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#616161',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(33, 33, 33, 0.05)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* 링크 섹션들 */}
          {footerSections.map((section, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1.5, 
                  color: '#212121',
                  fontSize: '0.95rem'
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {section.links.map((link, linkIndex) => (
                  <Link 
                    key={linkIndex} 
                    href={link.path} 
                    passHref 
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#616161',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          transition: 'color 0.2s ease-in-out'
                        },
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {link.text}
                    </Typography>
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)', mb: 2.5 }} />

        {/* 연락처 정보 */}
        <Box sx={{ mb: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Business sx={{ fontSize: 18, mr: 1, color: '#757575' }} />
                <Typography variant="body2" sx={{ color: '#616161', fontSize: '0.85rem' }}>
                  (주)하이어피커
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <LocationOn sx={{ fontSize: 18, mr: 1, color: '#757575' }} />
                <Typography variant="body2" sx={{ color: '#616161', fontSize: '0.85rem' }}>
                  서울특별시 강남구 테헤란로 123
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Phone sx={{ fontSize: 18, mr: 1, color: '#757575' }} />
                <Typography variant="body2" sx={{ color: '#616161', fontSize: '0.85rem' }}>
                  02-1234-5678
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Email sx={{ fontSize: 18, mr: 1, color: '#757575' }} />
                <Typography variant="body2" sx={{ color: '#616161', fontSize: '0.85rem' }}>
                  support@hirepicker.com
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)', mb: 2.5 }} />

        {/* 하단 정보 */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.8rem' }}>
            {'Copyright © '}
            <Box component="span" sx={{ fontWeight: 600, color: '#212121' }}>
              HirePicker
            </Box>
            {` ${new Date().getFullYear()}. All rights reserved.`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Link href="/support" passHref style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#757575',
                  fontSize: '0.8rem',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transition: 'color 0.2s ease-in-out'
                  },
                  cursor: 'pointer'
                }}
              >
                이용약관
              </Typography>
            </Link>
            <Typography variant="body2" sx={{ color: '#bdbdbd', fontSize: '0.8rem' }}>
              |
            </Typography>
            <Link href="/support" passHref style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#757575',
                  fontSize: '0.8rem',
                  '&:hover': { 
                    color: theme.palette.primary.main,
                    transition: 'color 0.2s ease-in-out'
                  },
                  cursor: 'pointer'
                }}
              >
                개인정보처리방침
              </Typography>
            </Link>
            <Typography variant="body2" sx={{ color: '#bdbdbd', fontSize: '0.8rem' }}>
              |
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.8rem' }}>
              대표: 김진환 | 사업자등록번호: 123-45-67890
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;