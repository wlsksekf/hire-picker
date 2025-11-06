// 상세 페이지는 동적 파라미터(inquiry_idx)를 사용하므로 클라이언트 컴포넌트로 선언
'use client';

import React from 'react';
import { Container, Typography, Box, Button, Paper, Divider, Grid, Stack, Avatar } from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // URL 파라미터를 가져오기 위한 훅

// API가 준비되기 전까지 사용할 임시 데이터
const getInquiryDetails = (id) => {
  // 실제로는 id를 사용해 API를 호출해야 해.
  return {
    id: id,
    category: '오류 신고',
    title: '이력서 저장 시 500 에러가 발생합니다.',
    content: '안녕하세요. 이력서를 작성하고 저장을 누르면 페이지가 하얗게 변하면서 500 에러가 발생합니다. 확인 부탁드립니다.',
    date: '2025-11-05',
    status: 'ANSWERED',
    answer_content: '안녕하세요, Hire-Picker 팀입니다. 문의주신 내용 확인하였으며, 해당 오류는 긴급하게 수정 조치 완료되었습니다. 이용에 불편을 드려 죄송합니다. 동일한 문제가 발생할 경우 다시 한번 문의 남겨주세요. 감사합니다.',
    answer_date: '2025-11-05'
  };
};

// '토스/당근' 스타일의 1:1 문의 상세 페이지 (채팅형)
const InquiryDetailPage = () => {
  const params = useParams();
  const inquiry_idx = params.inquiry_idx;
  const inquiry = getInquiryDetails(inquiry_idx);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 상단: 문의 제목 및 정보 */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, border: 'none', backgroundColor: 'background.paper', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>{inquiry.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {inquiry.category} · {inquiry.date}
        </Typography>
      </Paper>

      {/* 중앙: 채팅 대화 내용 */}
      <Stack spacing={2}>
        {/* 내 질문 (오른쪽) */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Paper sx={{
            p: 2,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: '18px 18px 4px 18px', // 토스/당근 스타일 말풍선
            maxWidth: '80%',
            wordBreak: 'break-word',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', // 은은한 그림자
          }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {inquiry.content}
            </Typography>
          </Paper>
        </Box>

        {/* 관리자 답변 (왼쪽) */}
        {inquiry.status === 'ANSWERED' ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
            <Avatar src="/picky.png" sx={{ width: 36, height: 36 }} /> {/* 아바타 크기 조정 */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                피키
              </Typography>
              <Paper sx={{
                p: 2,
                backgroundColor: '#f0f0f0',
                borderRadius: '4px 18px 18px 18px', // 토스/당근 스타일 말풍선
                maxWidth: '100%',
                wordBreak: 'break-word',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)', // 은은한 그림자
              }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {inquiry.answer_content}
                </Typography>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'left' }}>
                {inquiry.answer_date}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
            <Avatar src="/picky.png" sx={{ width: 36, height: 36 }} /> {/* 아바타 크기 조정 */}
            <Box>
               <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                피키
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f0f0f0', borderRadius: '4px 18px 18px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <Typography variant="body1" color="text.secondary">
                  문의 내용을 확인하고 있어요. 조금만 기다려주세요!
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Stack>

      {/* 하단: 목록으로 돌아가기 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Link href="/support/inquiries" passHref>
          <Button
            variant="contained"
            sx={{
              borderRadius: '12px',
              boxShadow: 'none',
              fontWeight: 'bold',
              py: 1.5,
            }}
          >
            목록으로
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default InquiryDetailPage;