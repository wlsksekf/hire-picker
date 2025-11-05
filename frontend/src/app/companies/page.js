"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  Box,
  Stack,
  CircularProgress,
  CardActions,
  Button,
  Chip,
  useTheme,
  Alert,
  TextField,
} from "@mui/material";
import { faLink, faIdBadge } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "@/api"; // 공용 api 인스턴스 사용
import Link from "next/link";

const PAGE_SIZE = 20; // 페이지 당 불러올 기업 수

// 기업 목록 페이지 컴포넌트
function CompaniesPage() {
  const theme = useTheme();
  const [companies, setCompanies] = useState([]); // 기업 목록
  const [page, setPage] = useState(0); // 현재 페이지 번호
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [hasNextPage, setHasNextPage] = useState(true); // 다음 페이지 존재 여부

  const [searchTerm, setSearchTerm] = useState(""); // 검색어 입력 값
  const [query, setQuery] = useState(""); // 실제 검색에 사용될 쿼리

  // 컴포넌트가 마운트되거나 쿼리가 변경될 때 기업 정보를 불러옴
  useEffect(
    function () {
      setLoading(true);
      const apiUrl = `/api/companies?page=0&size=${PAGE_SIZE}${
        query ? `&query=${query}` : ""
      }`;

      api
        .get(apiUrl)
        .then(function (response) {
          const data = response.data;
          const newCompanies = data._embedded
            ? data._embedded.companyDtoList
            : [];
          setCompanies(newCompanies);
          setHasNextPage(
            data.page && data.page.number < data.page.totalPages - 1
          );
          setPage(0);
          setError(null);
        })
        .catch(function (err) {
          setError(err);
          setCompanies([]);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [query]
  );

  // 다음 페이지의 기업 정보를 불러오는 함수
  function handleLoadMore() {
    const nextPage = page + 1;
    setLoading(true);
    const apiUrl = `/api/companies?page=${nextPage}&size=${PAGE_SIZE}${
      query ? `&query=${query}` : ""
    }`;

    api
      .get(apiUrl)
      .then(function (response) {
        const data = response.data;
        const newCompanies = data._embedded
          ? data._embedded.companyDtoList
          : [];
        setCompanies(function (prevCompanies) {
          return [...prevCompanies, ...newCompanies];
        });
        setHasNextPage(
          data.page && data.page.number < data.page.totalPages - 1
        );
        setPage(nextPage);
      })
      .catch(function (err) {
        setError(err);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  // 로고 URL을 반환하는 함수
  function getLogoUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) {
      return url;
    }
    return `https://www.work.go.kr/images/recruit/${url}`;
  }

  // 검색 폼 제출 시 실행될 함수
  function handleSearchSubmit(event) {
    event.preventDefault(); // 폼의 기본 제출 동작 방지
    setQuery(searchTerm); // 검색어를 쿼리로 설정하여 데이터 요청 트리거
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 5 }}
      >
        공채 기업 정보
      </Typography>

      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{ display: "flex", gap: 1, mb: 4 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="원하시는 기업명을 입력해주세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ whiteSpace: "nowrap" }}>
          검색
        </Button>
      </Box>

      {loading &&
        companies.length === 0 && ( // 초기 로딩 상태
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography>기업 정보를 불러오는 중...</Typography>
          </Box>
        )}

      {error && ( // 에러 상태
        <Alert severity="error">
          공채 기업 정보를 가져오는 데 실패했습니다: {error.message}
        </Alert>
      )}

      {!loading &&
        companies.length === 0 && ( // 검색 결과가 없을 때
          <Alert severity="info">검색 결과가 없습니다.</Alert>
        )}

      <Stack spacing={3}>
        {companies.map(function (company, index) {
          return company.status == "APPROVED" ? (
            <Link
              href={`/companies/${company.companyIdx}`}
              key={company.companyIdx || index}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  p: 3,
                  cursor: "pointer",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {getLogoUrl(company.logoUrl) ? (
                  <Box
                    component="img"
                    src={getLogoUrl(company.logoUrl)}
                    alt={`${company.name} logo`}
                    sx={{
                      width: 80,
                      height: 80,
                      mr: 4,
                      objectFit: "contain",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      mr: 4,
                      backgroundColor: "#fff",
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: "8px",
                    }}
                  />
                )}
                <Box
                  sx={{ flexGrow: 1, display: "flex", alignItems: "baseline" }}
                >
                  <Typography variant="h5" fontWeight="bold" sx={{ mr: 10 }}>
                    {company.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {company.summary}
                  </Typography>
                </Box>
                <CardActions sx={{ p: 0, ml: 2 }}>
                  {company.homepage && (
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = company.homepage.startsWith("http")
                          ? company.homepage
                          : `http://${company.homepage}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      startIcon={<FontAwesomeIcon icon={faLink} />}
                    >
                      홈페이지
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Link>
          ) : null;
        })}
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
        {hasNextPage && (
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading && companies.length > 0 ? (
              <CircularProgress size={24} />
            ) : (
              "더보기"
            )}
          </Button>
        )}
      </Box>

      {!hasNextPage && companies.length > 0 && (
        <Typography textAlign="center" sx={{ mt: 4, color: "text.secondary" }}>
          모든 정보를 불러왔습니다.
        </Typography>
      )}
    </Container>
  );
}

export default CompaniesPage;
