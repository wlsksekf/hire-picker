// InquiryDetailModal.jsx (새 파일)
'use client';

import {
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  TextField,
  Box,
  Paper, // Paper 컴포넌트 추가
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

// ⚠️ 임시 수정: MINT_PRIMARY_DARK 임포트 오류를 피하기 위해 임시로 색상값 정의
// 실제 프로젝트 환경에 맞게 상수를 올바르게 임포트하도록 수정해야 합니다.
const MINT_PRIMARY_DARK = '#00a680'; // 예시 색상 코드

/**
 * 1:1 문의 상세 확인 및 답변 등록/수정 모달 컴포넌트
 * @param {boolean} open - 모달 열림 상태
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {object} inquiry - 선택된 문의 상세 데이터
 */
export default function InquiryDetailModal({ open, onClose, inquiry }) {
  // 답변 내용을 관리할 상태
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // inquiry 객체에 status 필드가 '답변완료'인지 확인
  const isAnswered = inquiry?.status === '답변완료';

  // inquiry 데이터가 변경될 때마다 답변 필드를 업데이트
  useEffect(() => {
    if (inquiry) {
      // 기존 답변 내용(answerContent)이 있으면 로드, 없으면 빈 문자열
      setAnswerContent(inquiry.answerContent || '');
    }
  }, [inquiry]);

  // 데이터가 없을 때 렌더링 방지
  if (!inquiry) return null;

  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    // 답변 등록/수정 API 경로: /api/inquiries/{inquiryIdx}/answer
    const api_url = `/api/inquiries/${inquiry.inquiryIdx}/answer`;

    try {
      // 서버에 답변 데이터 전송 (status 필드도 업데이트되어야 함)
      await axios.post(api_url, { answerContent: answerContent }, { withCredentials: true, timeout: 90000 });

      alert('답변이 성공적으로 등록/수정되었습니다.');
      // 답변이 성공하면 부모 컴포넌트의 목록을 새로고침할 수 있도록 true를 전달
      onClose(true);
    } catch (error) {
      console.error('답변 제출 오류:', error);
      alert('답변 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
        문의 상세 내용 및 답변
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* 1. 문의 기본 정보 (읽기 전용) */}
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
            <Typography variant="caption" color="#9ca3af">
              문의 번호: {inquiry.inquiryIdx}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5, mb: 1 }}>
                <Chip
                    label={inquiry.category}
                    size="small"
                    // 정의된 MINT_PRIMARY_DARK 사용
                    sx={{ backgroundColor: MINT_PRIMARY_DARK, color: '#ffffff', fontWeight: 'bold' }}
                />
                <Chip
                    label={isAnswered ? '답변 완료' : '답변 대기'}
                    size="small"
                    color={isAnswered ? 'success' : 'warning'}
                />
            </Stack>
            <Typography variant="h6" fontWeight={700} color="#111827" sx={{ mt: 1 }}>
              {inquiry.title}
            </Typography>
            <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
              <Typography variant="body2">문의내용: {inquiry.content}</Typography>
            </Box>
            <Typography variant="caption" color="#9ca3af" sx={{ mt: 1, display: 'block' }}>
              접수일: {inquiry.updatedAt}
            </Typography>
          </Paper>

          {/* 2. 답변 입력/수정 필드 */}
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>
            답변 등록/수정
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="답변 내용을 입력하세요."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            disabled={isSubmitting}
            variant="outlined"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => onClose(false)} color="inherit" sx={{ textTransform: 'none' }}>
          닫기
        </Button>
        <Button
          onClick={handleAnswerSubmit}
          variant="contained"
          disabled={isSubmitting || !answerContent.trim()}
          sx={{
            textTransform: 'none',
            // 정의된 MINT_PRIMARY_DARK 사용
            backgroundColor: MINT_PRIMARY_DARK,
            '&:hover': { backgroundColor: '#00c494' }
          }}
        >
          {isSubmitting ? '등록 중...' : (isAnswered ? '답변 수정' : '답변 등록')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
