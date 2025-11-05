'''// 1:1 문의 등록 페이지는 사용자의 입력을 받아야 하므로 클라이언트 컴포넌트로 선언
'use client';

import React, { useState } from 'react';
import {
  Container, Typography, Box, TextField, Button, List, ListItemButton, ListItemText, IconButton, Chip, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// 문의 카테고리 데이터
const categories = ["계정", "결제", "오류 신고", "채용 공고", "기타"];

// '토스/당근' 스타일의 1:1 문의 등록 페이지
const NewInquiryPage = () => {
  // 폼 상태 관리
  const [step, setStep] = useState(1); // 1: 카테고리 선택, 2: 내용 입력
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 카테고리 선택 핸들러
  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setStep(2); // 다음 단계로 이동
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    setStep(1); // 이전 단계로 이동
  };

  // 폼 제출 핸들러 (현재는 콘솔에 출력만)
  const handleSubmit = (event) => {
    event.preventDefault();
    const inquiryData = { category, title, content };
    console.log('제출된 문의 내용:', inquiryData);
    alert('문의가 성공적으로 제출되었습니다.');
    // 여기에 나중에 API 호출 로직을 추가할 거야.
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      {/* 단계 1: 카테고리 선택 */}
      {step === 1 && (
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
            어떤 도움이 필요하신가요?
          </Typography>
          <Paper variant="outlined">
            <List disablePadding>
              {categories.map((cat, index) => (
                <ListItemButton key={cat} onClick={() => handleCategorySelect(cat)} divider={index < categories.length - 1}>
                  <ListItemText primary={cat} primaryTypographyProps={{ fontSize: '1.1rem', p: 1 }} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* 단계 2: 제목 및 내용 입력 */}
      {step === 2 && (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              문의 내용 입력
            </Typography>
          </Box>

          <Chip label={`유형: ${category}`} sx={{ mb: 3 }} />

          <TextField
            required
            fullWidth
            id="title"
            label="제목"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            required
            fullWidth
            id="content"
            label="자세한 내용을 알려주세요."
            name="content"
            multiline
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!title || !content} // 제목과 내용이 있어야 활성화
          >
            제출하기
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default NewInquiryPage;
'''