"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from "@mui/material";
import { api } from "@/api"; // 공용 api 인스턴스 사용
import FallbackImage from "@/components/FallbackImage"; // FallbackImage 컴포넌트 임포트

export default function AlarmPage() {
  const [likedCompanies, setLikedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    const fetchLikedCompanies = async () => {
      setLoading(true);
      try {
        // 1. 현재 로그인한 유저의 관심 기업 ID 목록 가져오기
        const response = await api.get(`/api/company-alarms/me/ids`);
        const companyIds = response.data;

        if (companyIds.length === 0) {
          setLikedCompanies([]);
          setLoading(false);
          return;
        }

        // 2. 각 회사 ID로 회사 상세 정보 가져오기
        const companyDetailsPromises = companyIds.map((companyIdx) =>
          api.get(`/api/companies/${companyIdx}`)
        );
        const companyDetailsResponses = await Promise.all(
          companyDetailsPromises
        );

        const companiesData = companyDetailsResponses.map((res) => res.data);
        setLikedCompanies(companiesData);
      } catch (err) {
        console.error("Failed to fetch liked companies:", err);
        setError("관심 기업 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedCompanies();
  }, [isAuthenticated, user]);

  // Base64로 인코딩된 1x1 흰색 투명 GIF 이미지
  const whitePixel =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  const getLogoUrl = (url) => {
    if (!url) return whitePixel; // URL이 없으면 흰색 픽셀 반환
    if (url.startsWith("http")) {
      return url;
    }
    // work.go.kr 로고 URL이 유효하지 않을 경우를 대비하여 whitePixel 반환
    // 실제 이미지 로드 실패는 FallbackImage에서 처리
    return `https://www.work.go.kr/images/recruit/${url}`;
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography>관심 기업 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: 8 }}>
        {" "}
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pt: 4, pb: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 2 }}
      >
        내 관심 기업
      </Typography>
      <Divider sx={{ mb: 4, borderColor: "grey" }} />

      {likedCompanies.length === 0 ? (
        <Alert severity="info">관심 기업으로 등록된 회사가 없습니다.</Alert>
      ) : (
        <Grid container columnSpacing={2} rowSpacing={1.5}>
          {likedCompanies.map((company) => (
            <Grid item key={company.companyIdx} xs={3} sm={3} md={3} lg={3}>
              <Link
                href={`/companies/${company.companyIdx}`}
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  sx={{
                    width: 260, // 고정된 카드 너비
                    height: 100, // 고정된 카드 높이
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    borderRadius: "12px",
                    cursor: "pointer", // 클릭 가능한 요소임을 나타냄
                    "&:hover": {
                      transform: "translateY(-2px)", // 호버 시 약간 위로 이동
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)", // 호버 시 그림자 강화
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0.5,
                      paddingBottom: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      flexGrow: 1,
                      pt: 2.3,
                      "&:last-child": {
                        paddingBottom: 0,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FallbackImage
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          objectFit: "contain", // 로고 내용이 잘리지 않도록 contain으로 변경
                          mr: 1,
                        }}
                        src={getLogoUrl(company.logoUrl)}
                        alt={`${company.name} 로고`}
                      />
                      <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{
                          flexShrink: 1, // 필요시 축소
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: "bold", // 회사명 폰트 두껍게
                          lineHeight: 1, // 세로 중앙 정렬을 위해 줄 높이 제거
                          margin: 0, // 모든 마진 제거
                          padding: 0, // 모든 패딩 제거
                        }}
                      >
                        {company.name}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
