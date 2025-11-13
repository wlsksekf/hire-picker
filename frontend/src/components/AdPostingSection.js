"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Card, Chip, IconButton, CardActions, Button } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";
import Link from 'next/link';
import { api } from '@/api';
import Bookmark from '@/components/BookMark';

/**
 * 광고 공고 섹션 컴포넌트 (좌우 스크롤)
 * 메인 페이지의 채용공고와 검색 바 사이에 표시
 */
export default function AdPostingSection({ onChatClick, onApplyClick }) {
  const theme = useTheme();
  const [adPostings, setAdPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  // 광고 공고 목록 조회
  useEffect(() => {
    fetchActiveAdPostings();
  }, []);

  const fetchActiveAdPostings = async () => {
    try {
      const response = await api.get('/api/ad-postings/active');
      setAdPostings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('[광고 공고] 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 광고 클릭 기록
  const handleAdClick = async (adPostingId) => {
    try {
      await api.post(`/api/ad-postings/${adPostingId}/click`);
    } catch (error) {
      console.error('[광고 공고] 클릭 기록 실패:', error);
    }
  };

  // 좌우 스크롤 핸들러
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // 한 번에 이동할 거리
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // 광고가 없으면 표시하지 않음
  if (!loading && adPostings.length === 0) {
    return null;
  }

  if (loading) {
    return null;
  }

  return (
    <Box sx={{ pb: 8, position: 'relative' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        광고 공고
      </Typography>

      {/* 스크롤 컨테이너 */}
      <Box sx={{ position: 'relative' }}>
        {/* 왼쪽 스크롤 버튼 */}
        {adPostings.length > 0 && (
          <IconButton
            onClick={() => scroll('left')}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              }
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}

        {/* 광고 카드 컨테이너 */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': {
              display: 'none' // Chrome, Safari
            },
            pb: 2
          }}
        >
          {adPostings.map((ad) => {
            const job = ad.jobPosting || {};
            // 이미지 URL 처리: 절대 URL(http/https)은 그대로, 상대 경로는 /를 붙임
            const imageUrl = job.imgUrl 
              ? (job.imgUrl.startsWith('http://') || job.imgUrl.startsWith('https://'))
                ? job.imgUrl
                : `/${job.imgUrl}`
              : null;

            return (
              <Card
                key={ad.adPostingId}
                sx={{
                  minWidth: 320,
                  maxWidth: 320,
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "background-color 0.2s, box-shadow 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {/* 광고 배지 - 오른쪽 위 */}
                <Chip
                  label="광고"
                  size="small"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />

                {/* 이미지 부분 */}
                <Link
                  href={`/postings/${job.postingIdx}`}
                  passHref
                  style={{ textDecoration: "none", color: "inherit" }}
                  onClick={() => handleAdClick(ad.adPostingId)}
                >
                  <Box
                    sx={{
                      height: "180px",
                      backgroundImage: (imageUrl && !imageUrl.includes('example.com'))
                        ? `url(${imageUrl})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: "#f5f5f5",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(!imageUrl || imageUrl.includes('example.com')) && (
                      <Typography variant="body2" color="text.secondary">
                        {job.companyName}
                      </Typography>
                    )}
                  </Box>
                </Link>

                {/* 카드 본문 부분 */}
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    overflow: "hidden",
                  }}
                >
                  {/* 내용 영역 */}
                  <Link
                    href={`/postings/${job.postingIdx}`}
                    passHref
                    style={{ 
                      textDecoration: "none", 
                      color: "inherit", 
                      flexGrow: 1, 
                      display: "flex", 
                      flexDirection: "column" 
                    }}
                    onClick={() => handleAdClick(ad.adPostingId)}
                  >
                    <Typography color="text.secondary" noWrap sx={{ mb: 1 }}>
                      {job.companyName}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {job.title}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, flexShrink: 0 }}>
                      {job.location && <Chip label={job.location} />}
                    </Box>
                  </Link>

                  {/* 버튼 영역 */}
                  <CardActions 
                    sx={{ 
                      mt: "auto",
                      pt: 2,
                      justifyContent: "flex-end", 
                      px: 0,
                      flexShrink: 0,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Box onClick={(e) => e.stopPropagation()}>
                      <Bookmark jobId={job.postingIdx} />
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onChatClick) {
                          onChatClick(job);
                        }
                      }}
                      sx={{ pointerEvents: 'auto', ml: 1 }}
                    >
                      실시간 채팅
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // 내부 지원 가능한 공고(c_user가 있는 경우)만 다이얼로그 열기
                        if (job.internal) {
                          if (onApplyClick) {
                            onApplyClick(job);
                          }
                        } else {
                          // 외부 지원 링크가 있으면 새 탭에서 열기
                          if (job.applyUrl) {
                            window.open(job.applyUrl, "_blank");
                          }
                        }
                      }}
                      sx={{ pointerEvents: 'auto', ml: 1 }}
                    >
                      지원하기
                    </Button>
                  </CardActions>
                </Box>
              </Card>
            );
          })}
        </Box>

        {/* 오른쪽 스크롤 버튼 */}
        {adPostings.length > 0 && (
          <IconButton
            onClick={() => scroll('right')}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              }
            }}
          >
            <ChevronRight />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

