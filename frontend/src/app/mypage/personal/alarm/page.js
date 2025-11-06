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
} from "@mui/material";
import { api } from "@/api"; // 공용 api 인스턴스 사용

export default function AlarmPage() {
  const [likedCompanies, setLikedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);
  const pUserIdx = user?.idx; // 로그인한 사용자 ID

  useEffect(() => {
    if (!pUserIdx) {
      setLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    const fetchLikedCompanies = async () => {
      try {
        // 1. p_user_idx로 관심 기업 ID 목록 가져오기
        const response = await api.get(`/api/company-alarms/user`);
        const companyIds = response.data; // [companyIdx1, companyIdx2, ...]

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
  }, [pUserIdx]);

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
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        내 관심 기업
      </Typography>

      {likedCompanies.length === 0 ? (
        <Alert severity="info">관심 기업으로 등록된 회사가 없습니다.</Alert>
      ) : (
        <Grid container spacing={3}>
          {likedCompanies.map((company) => (
            <Grid item key={company.companyIdx} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 140,
                    objectFit: "contain",
                    p: 2,
                    borderBottom: "1px solid #eee",
                  }}
                  image={getLogoUrl(company.logoUrl)}
                  alt={`${company.name} 로고`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {company.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {company.summary || "회사 요약 정보가 없습니다."}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
