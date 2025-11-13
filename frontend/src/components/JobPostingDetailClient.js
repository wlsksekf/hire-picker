"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faBriefcase,
  faGraduationCap,
  faCalendarAlt,
  faLink,
  faUsers,
  faGlobe,
  faUser,
  faListAlt,
  faStar,
  faDollarSign,
  faCalendarCheck,
  faCalendarTimes,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/api";
import Bookmark from "@/components/BookMark";
import WelfareBenefits from "@/components/WelfareBenefits";
import RequiredQualifications from "@/components/RequiredQualifications"; // Import the new component

function JobPostingDetailClient({ posting_idx }) {
  const theme = useTheme();
  const [jobPosting, setJobPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);
  const [logoError, setLogoError] = useState(false);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [jobPosting]); // jobPosting이 로드된 후 높이 측정

  useEffect(() => {
    if (posting_idx) {
      console.log("Fetching job posting details for:", posting_idx); // 추가된 로그
      setLoading(true);
      setLogoError(false);
      api
        .get(`/api/job-postings/idx/${posting_idx}`)
        .then((response) => {
          setJobPosting(response.data);
          setLoading(false);

          if (response.data && response.data.companyIdx) {
            setCompanyLoading(true);
            api
              .get(`/api/companies/${response.data.companyIdx}`)
              .then((companyResponse) => {
                setCompany(companyResponse.data);
                setCompanyLoading(false);
              })
              .catch((companyErr) => {
                setCompanyError(companyErr);
                setCompanyLoading(false);
              });
          } else {
            setCompanyLoading(false);
          }
        })
        .catch((err) => {
          console.error("JobPostingDetailClient: Job Posting API error:", err);
          setError(err);
          setLoading(false);
          setCompanyLoading(false);
        });
    } else {
      console.log("JobPostingDetailClient: posting_idx is null or undefined.");
    }
  }, [posting_idx]);

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

  if (!jobPosting) {
    return (
      <Container maxWidth="lg" sx={{ py: 5, textAlign: "center" }}>
        <Typography>채용 공고를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  const keyInfoItems = [
    { label: "회사명", value: jobPosting.companyName, icon: faBuilding },
    {
      label: "채용 우대사항",
      value: jobPosting.preferred_qualifications,
      icon: faStar,
    },
    { label: "급여 정보", value: jobPosting.salaryInfo, icon: faDollarSign },
    { label: "근무지", value: jobPosting.location, icon: faMapMarkerAlt },
    { label: "고용 형태", value: jobPosting.employmentType, icon: faBriefcase },
    {
      label: "요구경력",
      value: jobPosting.experience_level,
      icon: faGraduationCap,
    },
    { label: "시작일", value: jobPosting.startDate, icon: faCalendarCheck },
    { label: "마감일", value: jobPosting.endDate, icon: faCalendarTimes },
    { label: "지원 링크", value: jobPosting.link, icon: faLink, isLink: true },
  ].filter((item) => item.value);

  const midpoint = Math.ceil(keyInfoItems.length / 2);
  const leftItems = keyInfoItems.slice(0, midpoint);
  const rightItems = keyInfoItems.slice(midpoint);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          {/* Header */}
          <Paper
            elevation={0}
            // variant="outlined"
            sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}
          >
            <Typography
              variant="h4"
              component="h3"
              fontWeight="bold"
              gutterBottom
            >
              {jobPosting.title}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" color="text.secondary">
                {jobPosting.companyName}
              </Typography>
              {jobPosting.status && (
                <Chip
                  label={jobPosting.status === "OPEN" ? "지원가능" : "마감"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor:
                      jobPosting.status === "OPEN"
                        ? theme.palette.success.light
                        : theme.palette.error.light,
                    color: theme.palette.common.white,
                  }}
                />
              )}
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              {jobPosting.jobType && (
                <Chip
                  label={jobPosting.jobType}
                  size="medium"
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                />
              )}
              <Stack direction="row" spacing={1}>
                <Bookmark jobId={jobPosting.postingIdx} />
                <Button
                  variant="contained"
                  color="primary"
                  href={jobPosting.link}
                  target="_blank"
                  disabled={!jobPosting.link}
                  size="large"
                >
                  지원하기
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Main Content Grid */}
          {/* <Grid container spacing={4}> */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Key Information */}
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
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      {leftItems.map((item) => (
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start" // 아이콘과 텍스트의 세로 정렬을 위해 변경
                          key={item.label}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            style={{
                              color: theme.palette.text.secondary,
                              width: "18px",
                              marginTop: "4px", // 아이콘과 텍스트의 세로 정렬을 위해 추가
                            }}
                          />
                          <Box sx={{ display: "flex", flexGrow: 1 }}>
                            {" "}
                            {/* 라벨과 값을 감싸는 Box 추가 */}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                flexShrink: 0,
                                width: "150px",
                                noWrap: true,
                              }} // 라벨 너비 150px로 늘리고 noWrap 추가
                            >
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
                                sx={{
                                  fontWeight: 500,
                                  wordBreak: "break-all",
                                  flexGrow: 1, // 값이 남은 공간 채우도록
                                }}
                              >
                                {item.value}
                              </MuiLink>
                            ) : (
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  flexGrow: 1,
                                  wordBreak: "break-all",
                                }} // 값이 남은 공간 채우도록
                              >
                                {item.value}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      {rightItems.map((item) => (
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start" // 아이콘과 텍스트의 세로 정렬을 위해 변경
                          key={item.label}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            style={{
                              color: theme.palette.text.secondary,
                              width: "18px",
                              marginTop: "4px", // 아이콘과 텍스트의 세로 정렬을 위해 추가
                            }}
                          />
                          <Box sx={{ display: "flex", flexGrow: 1 }}>
                            {" "}
                            {/* 라벨과 값을 감싸는 Box 추가 */}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                flexShrink: 0,
                                width: "150px",
                                noWrap: true,
                              }} // 라벨 너비 150px로 늘리고 noWrap 추가
                            >
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
                                sx={{
                                  fontWeight: 500,
                                  wordBreak: "break-all",
                                  flexGrow: 1, // 값이 남은 공간 채우도록
                                }}
                              >
                                {item.value}
                              </MuiLink>
                            ) : (
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  flexGrow: 1,
                                  wordBreak: "break-all",
                                }} // 값이 남은 공간 채우도록
                              >
                                {item.value}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Job Description */}
              {jobPosting.description && (
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{ p: 4, borderRadius: 3 }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    직무 내용
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      lineHeight: 1.8,
                    }}
                  >
                    {jobPosting.description}
                  </Typography>
                </Paper>
              )}

              {/* Required Qualifications */}
              {jobPosting.required_qualifications && (
                <RequiredQualifications
                  qualifications={jobPosting.required_qualifications}
                />
              )}

              {/* Welfare Benefits */}
              {jobPosting.welfare && (
                <WelfareBenefits welfare={jobPosting.welfare} />
              )}

              {/* Company Information */}
              <Paper
                elevation={0}
                variant="outlined"
                sx={{ p: 4, borderRadius: 3 }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  회사 정보
                </Typography>
                <Divider sx={{ my: 2 }} />
                {companyLoading ? (
                  <CircularProgress size={24} />
                ) : companyError ? (
                  <Alert severity="warning">
                    회사 정보를 불러오는 데 실패했습니다.
                  </Alert>
                ) : company ? (
                  (() => {
                    const companyInfoItems = [
                      {
                        label: "설립일",
                        value: company.foundedDate,
                        icon: faCalendarAlt,
                      },
                      {
                        label: "직원 수",
                        value: company.employeeCount,
                        icon: faUsers,
                      },
                      {
                        label: "대표자",
                        value: company.ceoName,
                        icon: faUser,
                      },
                      {
                        label: "홈페이지",
                        value: company.homepage,
                        icon: faGlobe,
                        isLink: true,
                      },
                      {
                        label: "주요 산업",
                        value: company.industry,
                        icon: faListAlt,
                      },
                    ].filter((item) => item.value);

                    const companyMidpoint = Math.ceil(
                      companyInfoItems.length / 2
                    );
                    const companyLeftItems = companyInfoItems.slice(
                      0,
                      companyMidpoint
                    );
                    const companyRightItems =
                      companyInfoItems.slice(companyMidpoint);

                    return (
                      <Stack spacing={3}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          {logoError || !getLogoUrl(company.logoUrl) ? (
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: "grey.200",
                                borderRadius: 1.5,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                              }}
                            >
                              {company.logoUrl?.charAt(0) ?? "C"}
                            </Box>
                          ) : (
                            <Box
                              component="img"
                              src={getLogoUrl(company.logoUrl)}
                              alt="company-logo"
                              onError={() => setLogoError(true)}
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 1.5,
                                flexShrink: 0,
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {company.companyName ?? jobPosting.companyName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {company.companyType}
                            </Typography>
                          </Box>
                        </Box>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={2}>
                              {companyLeftItems.map((item) => (
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="flex-start"
                                  key={item.label}
                                >
                                  <FontAwesomeIcon
                                    icon={item.icon}
                                    style={{
                                      color: theme.palette.text.secondary,
                                      width: "18px",
                                      marginTop: "4px",
                                    }}
                                  />
                                  <Box sx={{ display: "flex", flexGrow: 1 }}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        flexShrink: 0,
                                        width: "150px",
                                        noWrap: true,
                                      }}
                                    >
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
                                        sx={{
                                          fontWeight: 500,
                                          wordBreak: "break-all",
                                          flexGrow: 1,
                                        }}
                                      >
                                        {item.value}
                                      </MuiLink>
                                    ) : (
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          fontWeight: 500,
                                          wordBreak: "break-all",
                                          flexGrow: 1,
                                        }}
                                      >
                                        {item.value}
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              ))}
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={2}>
                              {companyRightItems.map((item) => (
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="flex-start"
                                  key={item.label}
                                >
                                  <FontAwesomeIcon
                                    icon={item.icon}
                                    style={{
                                      color: theme.palette.text.secondary,
                                      width: "18px",
                                      marginTop: "4px",
                                    }}
                                  />
                                  <Box sx={{ display: "flex", flexGrow: 1 }}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        flexShrink: 0,
                                        width: "150px",
                                        noWrap: true,
                                      }}
                                    >
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
                                        sx={{
                                          fontWeight: 500,
                                          wordBreak: "break-all",
                                          flexGrow: 1,
                                        }}
                                      >
                                        {item.value}
                                      </MuiLink>
                                    ) : (
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          fontWeight: 500,
                                          wordBreak: "break-all",
                                          flexGrow: 1,
                                        }}
                                      >
                                        {item.value}
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              ))}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Stack>
                    );
                  })()
                ) : (
                  <Typography color="text.secondary">
                    회사 정보가 제공되지 않았습니다.
                  </Typography>
                )}
              </Paper>
            </Stack>
          </Grid>
          {/* </Grid> */}
        </Stack>
      </Container>
    </Box>
  );
}

export default JobPostingDetailClient;
