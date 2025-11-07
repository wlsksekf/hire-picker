"use client";

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

export default function AlarmPage() {
  const [likedCompanies, setLikedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);
  const [pUserIdx, setPUserIdx] = useState(null); // pUserIdx를 state로 관리

  useEffect(() => {
    const fetchUserIdx = async () => {
      if (user?.email) {
        try {
          const response = await api.get("/api/company-alarms/idx-by-email", {
            params: { email: user.email },
          });
          setPUserIdx(response.data.idx);
        } catch (err) {
          console.error("Failed to fetch user index:", err);
          setError("사용자 정보를 가져오는데 실패했습니다.");
          setLoading(false);
        }
      } else if (!user) {
        setLoading(false);
        setError("로그인이 필요합니다.");
      }
    };

    fetchUserIdx();
  }, [user]);

  useEffect(() => {
    if (!pUserIdx) {
      // pUserIdx가 아직 설정되지 않았으면 로딩 상태를 유지하거나,
      // user 정보는 있지만 pUserIdx를 받아오지 못한 경우에 대한 처리를 할 수 있습니다.
      if (user) setLoading(true);
      return;
    }

    const fetchLikedCompanies = async () => {
      setLoading(true);
      try {
        // 1. p_user_idx로 관심 기업 ID 목록 가져오기
        const response = await api.get(`/api/company-alarms/user/${pUserIdx}`);
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
  }, [pUserIdx, user]);

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) {
      return url;
    }
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
              <Card
                sx={{
                  width: 260, // 고정된 카드 너비
                  height: 100, // 고정된 카드 높이
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
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
                    <CardMedia
                      component="img"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        objectFit: "contain", // 로고 내용이 잘리지 않도록 contain으로 변경
                        mr: 1,
                      }}
                      image={getLogoUrl(company.logoUrl)}
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
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
