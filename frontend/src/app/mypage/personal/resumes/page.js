'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField, // 1. TextField 임포트
  Button, // 2. Button 임포트
  CircularProgress, // 3. 로딩 아이콘 임포트
  Paper, // 기존 UI 유지를 위해 Paper 임포트
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'; // 기존 UI 유지를 위해 DataGrid 임포트
import { useAuthStore } from '@/store/authStore'; // 4. authStore 임포트 (토큰 필요)
import { generateAiFullDraft as generateAiResume } from '@/api'; // 5. API 함수 임포트 (이름 별칭 사용)

// --- 기존 이력서 목록 관련 코드 시작 ---
// DataGrid 컬럼 정의
const columns = [
  { field: 'title', headerName: '이력서 제목', width: 400 },
  { field: 'status', headerName: '상태', width: 150 },
  { field: 'lastModified', headerName: '최종 수정일', width: 200 },
  {
    field: 'actions',
    headerName: '관리',
    width: 150,
    renderCell: function(params) {
      return (
        <Box>
          <Button size="small" sx={{ mr: 1 }}>수정</Button>
          <Button size="small" color="error">삭제</Button>
        </Box>
      );
    },
  },
];

// DataGrid 행 데이터 (예시)
const rows = [
  { id: 1, title: '프론트엔드 개발자 이력서 (React)', status: '작성 완료', lastModified: '2024-10-26' },
  { id: 2, title: '신입 백엔드 개발자 포트폴리오', status: '작성 중', lastModified: '2024-10-25' },
  { id: 3, title: '[경력] 데브옵스 엔지니어', status: '작성 완료', lastModified: '2024-10-24' },
];
// --- 기존 이력서 목록 관련 코드 끝 ---


export default function ResumesPage() {
  // [AI 기능 추가] AI 생성기 관련 상태
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
      // api/index.js의 인터셉터가 토큰을 자동으로 추가해주므로, 토큰을 넘길 필요가 없습니다.
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
    <Container maxWidth="lg"> {/* 너비를 lg로 변경하여 공간 확보 */}
      {/* ========== [AI 기능 추가] AI 이력서 생성기 UI ========== */}
      <Paper
        sx={{
          p: 3,
          mb: 4, // 아래 컴포넌트와의 간격
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
            rows={5} // 여러 줄을 볼 수 있도록 행 수 추가
            label="AI 생성 결과 (이 내용을 복사하여 아래 이력서에 사용하세요)"
            variant="outlined"
            value={aiResult}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 3 }}
          />
        )}
      </Paper>
      {/* ======================================================= */}

      {/* --- 기존 이력서 목록 UI --- */}
       <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                이력서 관리
            </Typography>
            <Button variant="contained" color="primary">
                새 이력서 작성
            </Button>
        </Box>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Paper>
    </Container>
  );
}