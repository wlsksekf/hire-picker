"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Link as MuiLink,
  Grid,
  Divider,
  useTheme,
  Stack,
  IconButton,
  Modal,
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUser,
  faMapMarkerAlt,
  faUsers,
  faGlobe,
  faFileInvoiceDollar,
  faGift,
  faInfoCircle,
  faAddressCard,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/api";

// Helper component for rendering Welfare & Benefits with relevant emojis
const WelfareList = ({ text }) => {
  const keywordMap = {
    "🍔": ["식사", "점심", "저녁", "식대", "푸드", "스낵"],
    "🚗": ["교통", "주차", "셔틀", "유류비"],
    "❤️": ["건강", "검진", "보험", "의료"],
    "🌴": ["휴가", "연차", "휴양", "리프레시"],
    "📚": ["교육", "성장", "세미나", "스터디", "도서"],
    "💪": ["운동", "피트니스", "헬스"],
    "💰": ["보너스", "인센티브", "상여", "스톡옵션"],
    "🏠": ["주택", "대출", "거주"],
    "💻": ["장비", "맥북", "모니터"],
  };

  const getEmojiForLine = (line) => {
    for (const emoji in keywordMap) {
      for (const keyword of keywordMap[emoji]) {
        if (line.includes(keyword)) {
          return emoji;
        }
      }
    }
    return "✅"; // Default emoji
  };

  const benefits = text.split("\n").filter((line) => line.trim() !== "");

  return (
    <Stack spacing={1.5}>
      {benefits.map((line, index) => (
        <Box
          key={index}
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Typography component="span" sx={{ fontSize: "1.2rem" }}>
            {getEmojiForLine(line)}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ flex: 1 }}>
            {line}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

function CompanyDetailPage() {
  const { idx } = useParams();
  const theme = useTheme();
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);

  const reviewsPerPage = 4;
  const pageCount = Math.ceil(reviews.length / reviewsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const currentReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  useEffect(() => {
    if (idx) {
      setLoading(true);
      setLogoError(false);
      api
        .get(`/api/companies/${idx}`)
        .then((response) => {
          setCompany(response.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });

      setReviewsLoading(true);
      api
        .get(`/api/reviews/companies/${idx}`)
        .then((response) => {
          setReviews(response.data);
          setReviewsLoading(false);
        })
        .catch((err) => {
          setReviewsLoading(false);
        });
    }
  }, [idx]);

  function getLogoUrl(url) {
    if (!url) return null;
    return url.startsWith("http")
      ? url
      : `https://www.work.go.kr/images/recruit/${url}`;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="error">{error.message}</Alert>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <Typography>기업 정보를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  const keyInfoItems = [
    { label: "대표자", value: company.ceoNm, icon: faUser },
    { label: "직원 수", value: company.employeeCount, icon: faUsers },
    { label: "주소", value: company.adres, icon: faMapMarkerAlt },
    {
      label: "매출액",
      value: company.sales_amount
        ? `${(company.sales_amount / 100000000).toLocaleString()} 억원`
        : null,
      icon: faFileInvoiceDollar,
    },
    { label: "웹사이트", value: company.homepage, icon: faGlobe, isLink: true },
  ];

  const logoUrl = getLogoUrl(company.logoUrl);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // 가로 중앙
        minHeight: "100vh", // 화면 전체 높이 차지
        p: 11,
        bgcolor: "background.default", // 배경색 (선택)
      }}
    >
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="flex-start"
        sx={{ maxWidth: 1200 }}
      >
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ flexWrap: "nowrap" }} // 줄바꿈 방지
            >
              {logoError || !logoUrl ? (
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={logoUrl}
                  alt={`${company.name} logo`}
                  onError={() => setLogoError(true)}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: "contain",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 1,
                    flexShrink: 0, // 로고 크기 고정
                  }}
                />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  component="h1"
                  fontWeight="bold"
                  noWrap
                >
                  {company.name}
                </Typography>
                {company.companyType && (
                  <Chip
                    label={company.companyType}
                    size="small"
                    sx={{ mt: 1, fontWeight: 500 }}
                  />
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {company.summary && (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{ p: 4, borderRadius: 3 }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  기업 소개
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {company.summary}
                </Typography>
              </Paper>
            )}

            <Paper
              elevation={0}
              variant="outlined"
              sx={{ p: 4, borderRadius: 3 }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                주요 정보
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {keyInfoItems
                  .filter((item) => item.value)
                  .map((item) => (
                    <Grid item xs={12} sm={6} key={item.label}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          style={{
                            color: theme.palette.text.secondary,
                            width: "18px",
                            marginTop: "4px",
                          }}
                        />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.label}
                          </Typography>
                          {item.isLink ? (
                            <MuiLink
                              href={
                                item.value.startsWith("http")
                                  ? item.value
                                  : `http://${item.value}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.value}
                            </MuiLink>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.value}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </Paper>

            {company.welfare_benefits && (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{ p: 4, borderRadius: 3 }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  복지 및 혜택
                </Typography>
                <Divider sx={{ my: 2 }} />
                <WelfareList text={company.welfare_benefits} />
              </Paper>
            )}

            <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                기업 리뷰
              </Typography>
              <Divider sx={{ my: 2 }} />
              {reviewsLoading ? (
                <CircularProgress size={24} />
              ) : reviews.length > 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconButton
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                  >
                    <ArrowBackIos />
                  </IconButton>
                  <Grid
                    container
                    spacing={2}
                    alignItems="stretch"
                    sx={{ flex: 1 }}
                  >
                    {currentReviews.map((review, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                          onClick={() => setSelectedReview(review)}
                          sx={{
                            p: 3,
                            width: 180, // 고정된 카드 너비
                            height: 200, // 고정된 카드 높이
                            // height: "100%",
                            // minHeight: "200px",
                            backgroundColor: "#f8f8f8",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            cursor: "pointer",
                          }}
                        >
                          <div>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {review.reviewerType === "CURRENT"
                                ? "현직원"
                                : "전직원"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{
                                mt: 1.5,
                                mb: 2,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {review.content}
                            </Typography>
                          </div>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ display: "block", textAlign: "right" }}
                          >
                            {new Date(review.writeDate).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  <IconButton
                    onClick={handleNextPage}
                    disabled={currentPage >= pageCount - 1}
                  >
                    <ArrowForwardIos />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  아직 작성된 리뷰가 없습니다.
                </Typography>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {selectedReview && (
        <Modal
          open={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          aria-labelledby="review-modal-title"
          aria-describedby="review-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              outline: 0,
            }}
          >
            <Typography id="review-modal-title" variant="h6" component="h2">
              {selectedReview.reviewerType === "CURRENT" ? "현직원" : "전직원"}
            </Typography>
            <Typography id="review-modal-description" sx={{ mt: 2 }}>
              {selectedReview.content}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ mt: 2, display: "block", textAlign: "right" }}
            >
              {new Date(selectedReview.writeDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Modal>
      )}
    </Box>
  );
}
export default CompanyDetailPage;
