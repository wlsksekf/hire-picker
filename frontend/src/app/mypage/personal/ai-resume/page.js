'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import { generateAiFullDraft as generateAiResume } from '@/api';

export default function AiResumePage() {
  // AI 생성기 관련 상태
  const [keywords, setKeywords] = useState(''); // 키워드 입력
  const [aiResult, setAiResult] = useState(''); // AI 결과물
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // AI 생성 버튼 클릭 시 실행될 함수
  const handleGenerateClick = async () => {
    if (!keywords) {
      alert('키워드를 입력해 주세요.');
      return;
    }
    setIsLoading(true);
    setAiResult(''); // 이전 결과 초기화

    try {
      const result = await generateAiResume(keywords);
      setAiResult(result); // 성공 시 결과 저장
    } catch (error) {
      setAiResult(
        '이력서 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper
        sx={{
          p: 3,
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          🚀 AI 경력 사항 생성기 (Beta)
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          핵심 키워드를 입력해 보세요. (예: React, Spring Boot, JWT, 성능 개선)
        </Typography>
        <TextField
          fullWidth
          label="키워드 입력"
          variant="outlined"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          sx={{ mb: 2, mt: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleGenerateClick}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? '생성 중...' : 'AI로 생성하기'}
        </Button>

        {/* AI 결과 표시 영역 */}
        {aiResult && (
          <TextField
            fullWidth
            multiline
            rows={10} // 결과물이 잘 보이도록 행 수 증가
            label="AI 생성 결과"
            variant="outlined"
            value={aiResult}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 3 }}
          />
        )}
      </Paper>
    </Container>
  );
}