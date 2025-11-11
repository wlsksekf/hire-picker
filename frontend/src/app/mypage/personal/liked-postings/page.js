"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { api } from "@/api";

export default function LikedPostingsPage() {
  // 즐겨찾기 목록 상태
  const [bookmarks, setBookmarks] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 메시지
  const [error, setError] = useState(null);
  const router = useRouter();

  // 즐겨찾기 목록 조회 함수
  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/personal/posting-bookmarks");
      setBookmarks(response.data || []);
    } catch (err) {
      console.error("Failed to load bookmarked postings:", err);
      setError("즐겨찾기한 채용공고를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 진입 시 목록 조회
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // 즐겨찾기 해제 처리
  const handleRemove = useCallback(async (postingIdx) => {
    try {
      await api.delete(`/api/personal/posting-bookmarks/${postingIdx}`);
      setBookmarks((prev) => prev.filter((item) => item.postingIdx !== postingIdx));
    } catch (err) {
      console.error("Failed to remove bookmarked posting:", err);
      setError("즐겨찾기 해제에 실패했습니다.");
    }
  }, []);

  // 상세 페이지 이동 (추후 실제 경로에 맞게 조정 필요)
  const handleNavigateDetail = useCallback(
    (postingIdx) => {
      router.push(`/jobs/${postingIdx}`);
    },
    [router]
  );

  // 날짜 포매팅 유틸
  const formatDate = (value) => {
    if (!value) return "정보 없음";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "정보 없음";
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>즐겨찾기한 채용공고를 불러오는 중입니다.</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pt: 4, pb: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        즐겨찾기한 채용공고
      </Typography>
      {bookmarks.length === 0 ? (
        <Alert severity="info">즐겨찾기한 채용공고가 없습니다.</Alert>
      ) : (
        // 카드 레이아웃: 세로 정렬하여 스크롤하며 확인
        <Stack spacing={2}>
          {bookmarks.map((bookmark) => (
            <Card
              key={bookmark.postingIdx}
              sx={{
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "12px",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" component="h2" fontWeight="bold">
                    {bookmark.title || "제목 없음"}
                  </Typography>
                  {bookmark.status && (
                    <Chip
                      label={bookmark.status}
                      size="small"
                      color={bookmark.status === "OPEN" ? "success" : "default"}
                    />
                  )}
                </Stack>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                  {bookmark.companyName || "회사 정보 없음"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  근무 지역: {bookmark.location || "정보 없음"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  모집 시작: {formatDate(bookmark.startDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  모집 마감: {formatDate(bookmark.endDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  등록일: {formatDate(bookmark.regDate)}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <Button variant="outlined" onClick={() => handleNavigateDetail(bookmark.postingIdx)}>
                  상세보기
                </Button>
                <Button variant="contained" color="error" onClick={() => handleRemove(bookmark.postingIdx)}>
                  즐겨찾기 해제
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

