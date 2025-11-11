"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    console.log("JobPostingDetailClient: posting_idx prop received:", posting_idx);
    if (posting_idx) {
      setLoading(true);
      setLogoError(false);
      api
        .get(`/api/job-postings/idx/${posting_idx}`)
        .then((response) => {
          console.log("JobPostingDetailClient: API response data:", response.data);
          setJobPosting(response.data);
          setLoading(false);

          if (response.data && response.data.companyIdx) {
            setCompanyLoading(true);
            api
              .get(`/api/companies/${response.data.companyIdx}`)
              .then((companyResponse) => {
                console.log("JobPostingDetailClient: Company API response data:", companyResponse.data);
                setCompany(companyResponse.data);
                setCompanyLoading(false);
              })
              .catch((companyErr) => {
                console.error("JobPostingDetailClient: Company API error:", companyErr);
                setCompanyError(companyErr);
                setCompanyLoading(false);
              });
          } else {
            console.log("JobPostingDetailClient: No companyIdx found in job posting data.");
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
    {
      label: "요구 경력",
      value: jobPosting.experienceLevel,
      icon: faGraduationCap,
    },
    { label: "급여 정보", value: jobPosting.salaryInfo, icon: faDollarSign },
    { label: "근무지", value: jobPosting.location, icon: faMapMarkerAlt },
    { label: "고용 형태", value: jobPosting.employmentType, icon: faBriefcase },
    {
      label: "경력",
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
            variant="outlined"
            sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              {jobPosting.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {jobPosting.companyName}
            </Typography>
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
                <Bookmark jobId={jobPosting.id} />
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
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Stack spacing={4}>
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
                      <Stack spacing={3}>
                        {leftItems.map((item) => (
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            key={item.label}
                          >
                            <FontAwesomeIcon
                              icon={item.icon}
                              style={{
                                color: theme.palette.text.secondary,
                                width: "18px",
                              }}
                            />
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="baseline"
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ flexShrink: 0 }}
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
                                  }}
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
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={3}>
                        {rightItems.map((item) => (
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            key={item.label}
                          >
                            <FontAwesomeIcon
                              icon={item.icon}
                              style={{
                                color: theme.palette.text.secondary,
                                width: "18px",
                              }}
                            />
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="baseline"
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ flexShrink: 0 }}
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
                                  }}
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
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>

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
                    <Stack spacing={3}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
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
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faBuilding}
                              style={{
                                color: theme.palette.text.secondary,
                                width: "24px",
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            component="img"
                            src={getLogoUrl(company.logoUrl)}
                            alt={`${company.name} logo`}
                            onError={() => setLogoError(true)}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: "contain",
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1.5,
                              p: 0.5,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Typography variant="h6" fontWeight="bold">
                          {company.name}
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        {[
                          {
                            label: "대표자",
                            value: company.ceoNm,
                            icon: faUser,
                          },
                          {
                            label: "직원 수",
                            value: company.employeeCount,
                            icon: faUsers,
                          },
                          {
                            label: "주소",
                            value: company.adres,
                            icon: faMapMarkerAlt,
                          },
                          {
                            label: "웹사이트",
                            value: company.homepage,
                            icon: faGlobe,
                            isLink: true,
                          },
                        ]
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
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {item.label}
                                  </Typography>
                                  {item.isLink ? (
                                    <MuiLink
                                      href={
                                        item.value &&
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
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      회사 정보를 불러올 수 없습니다.
                    </Typography>
                  )}
                </Paper>

                {/* Detailed Description */}
                {jobPosting.description && (
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{ p: 4, borderRadius: 3 }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      상세 내용
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                        wordBreak: "keep-all",
                      }}
                    >
                      {jobPosting.description}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

export default JobPostingDetailClient;
