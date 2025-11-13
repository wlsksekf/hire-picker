// InquiryManagementTab.jsx
'use client';

import {
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { MINT_PRIMARY_DARK } from '../adminTheme';
import { useEffect, useState } from 'react';
import axios from 'axios';
import InquiryDetailModal from '@/components/Inquiry/InquiryDetailModal';
// ✅ 모달 컴포넌트를 임포트합니다.


export default function InquiryManagementTab() {
  const [inquiries, setInquiries] = useState([]);
  // ✅ 모달 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✅ 선택된 문의 데이터를 저장할 상태 추가
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [loading, setLoading]=useState(true);
  const api_url = "/api/inquiries"

  // 🔽 문의 목록을 서버에서 불러오는 함수
  const fetchInquiries = () => {
    setLoading(true);
    axios.get(api_url, { withCredentials: true, timeout: 90000 })
      .then(function(res) {
        // 서버 응답에서 문의 목록 데이터가 있다고 가정합니다.
        setInquiries(res.data.inquiries || []);
        console.log(res.data + "데이타요데이타");
      })
      .catch(function(error) {
        console.error("문의 목록 로드 실패:", error);
      })
      .finally(function() {
        setLoading(false);
      });
  };

  // 🔽 컴포넌트 마운트 시 문의 목록 로드
  useEffect(function() {
    fetchInquiries();
  }, []);

  // 🔽 "내용 확인" 버튼 핸들러
  const handleOpenDetail = (inquiry) => {
    setSelectedInquiry(inquiry); // 선택된 문의 데이터 저장
    setIsModalOpen(true);       // 모달 열기
  };

  // 🔽 모달 닫기 핸들러
  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    setSelectedInquiry(null); // 데이터 초기화

    // 모달에서 답변 등록/수정이 성공했다면 목록 새로고침
    if (refresh) {
        fetchInquiries();
    }
  };


  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        boxShadow: '0 18px 32px -30px rgba(17,24,39,0.3)',
        background: '#ffffff',
        border: '1px solid rgba(17,24,39,0.06)',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700} color="#111827">
            1:1 문의 관리
          </Typography>
          {loading && <Typography variant="caption">로딩 중...</Typography>}
        </Stack>

        <Stack spacing={2}>
          {inquiries.map((item) => (
            <Paper
              key={item.inquiryIdx}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 2.5,
                borderColor: 'rgba(17,24,39,0.08)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" fontWeight={700} color="#111827">
                    {/* 문의 발신자나 ID를 표시 */}
                    ({item.inquiryIdx})
                  </Typography>
                  <Typography variant="subtitle1" color="#111827">
                    민원구분: {item.category}
                  </Typography>
                  <Typography variant="caption" color="#9ca3af">
                    제목: {item.title}
                  </Typography>
                  <Typography variant="caption" color="#9ca3af">
                    날짜: {item.updatedAt}
                  </Typography>
                  <Chip
                    label={item.status || '대기'}
                    size="small"
                    color={item.status === '답변완료' ? 'success' : 'warning'}
                    sx={{ width: 'fit-content' }}
                  />
                </Stack>
                <Stack spacing={1} alignItems="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenDetail(item)} // ✅ 클릭 시 모달 열기 함수 호출
                    sx={{ textTransform: 'none', borderRadius: 2, color: MINT_PRIMARY_DARK }}
                  >
                    내용 확인
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
          {!loading && inquiries.length === 0 && (
             <Typography sx={{ p: 2, textAlign: 'center', color: '#6b7280' }}>
               접수된 문의가 없습니다.
             </Typography>
          )}
        </Stack>
      </Stack>

      {/* 3. 모달 컴포넌트 렌더링 */}
      {selectedInquiry && (
          <InquiryDetailModal
              open={isModalOpen}
              onClose={handleCloseModal}
              inquiry={selectedInquiry}
          />
      )}
    </Paper>
  );
}
