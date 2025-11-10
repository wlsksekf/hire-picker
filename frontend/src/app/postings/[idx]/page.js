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
  Button, // Import Button
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faBriefcase,
  faGraduationCap,
  faCalendarAlt,
  faLink,
  faUsers, // Import faUsers for employee count
  faGlobe, // Import faGlobe for website
  faUser, // Import faUser for CEO name
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/api";
import Bookmark from "@/components/BookMark"; // Import Bookmark component

function JobPostingDetailPage() {
  const { idx: posting_idx } = useParams(); // Rename idx to posting_idx
  const theme = useTheme();
  const [jobPosting, setJobPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);
  const [logoError, setLogoError] = useState(false); // For company logo error

  useEffect(() => {
    if (posting_idx) {
      console.log(
        `[JobPostingDetailPage] Fetching job posting for posting_idx: ${posting_idx}`
      );
      setLoading(true);
      setLogoError(false); // Reset logo error on new ID
      api
        .get(`/api/job-postings/idx/${posting_idx}`)
        .then((response) => {
          console.log(
            `[JobPostingDetailPage] Job posting API response:`,
            response.data
          );
          setJobPosting(response.data);
          setLoading(false);

          // Fetch company details using companyIdx from jobPosting
          if (response.data && response.data.companyIdx) {
            console.log(
              `[JobPostingDetailPage] Fetching company details for companyIdx: ${response.data.companyIdx}`
            );
            setCompanyLoading(true);
            api
              .get(`/api/companies/${response.data.companyIdx}`)
              .then((companyResponse) => {
                console.log(
                  `[JobPostingDetailPage] Company API response:`,
                  companyResponse.data
                );
                setCompany(companyResponse.data);
                setCompanyLoading(false);
              })
              .catch((companyErr) => {
                console.error(
                  `[JobPostingDetailPage] Error fetching company details:`,
                  companyErr
                );
                setCompanyError(companyErr);
                setCompanyLoading(false);
              });
          } else {
            console.log(
              `[JobPostingDetailPage] No companyIdx found in job posting data.`
            );
            setCompanyLoading(false); // No companyIdx to fetch
          }
        })
        .catch((err) => {
          console.error(
            `[JobPostingDetailPage] Error fetching job posting details:`,
            err
          );
          setError(err);
          setLoading(false);
          setCompanyLoading(false); // Stop company loading if job posting fails
        });
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
    { label: "근무지", value: jobPosting.location, icon: faMapMarkerAlt },
    { label: "고용 형태", value: jobPosting.employmentType, icon: faBriefcase },
    {
      label: "경력",
      value: jobPosting.experience_level,
      icon: faGraduationCap,
    },
    { label: "마감일", value: jobPosting.deadline, icon: faCalendarAlt },
    { label: "지원 링크", value: jobPosting.link, icon: faLink, isLink: true },
  ].filter((item) => item.value); // Filter out items with null or empty values

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        p: 11,
        bgcolor: "background.default",
      }}
    >
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="flex-start"
        sx={{ maxWidth: 1200 }}
      >
        {/* Left Column (for header) */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ mb: 2 }}>
            {" "}
            {/* Added margin-bottom */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  component="h1"
                  fontWeight="bold"
                  noWrap
                >
                  {jobPosting.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  {jobPosting.companyName}
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}
                >
                  {jobPosting.jobType && (
                    <Chip
                      label={jobPosting.jobType}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                  <Box sx={{ flexGrow: 1 }} />{" "}
                  {/* Pushes buttons to the right */}
                  <Bookmark jobId={jobPosting.postingIdx} />
                  <Button
                    variant="contained"
                    href={jobPosting.link}
                    target="_blank"
                    disabled={!jobPosting.link}
                  >
                    지원하기
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column (for details) */}
        <Grid item xs={12} md={8}>
          <Stack spacing={1}>
            {" "}
            {/* Reverted spacing */}
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
                {keyInfoItems.map((item) => (
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.value}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
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
                <Alert severity="error">
                  회사 정보를 불러오는 데 실패했습니다: {companyError.message}
                </Alert>
              ) : company ? (
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {logoError || !getLogoUrl(company.logoUrl) ? (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                      />
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
                          borderRadius: 1,
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
                    {company.ceoNm && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faUser}
                            style={{
                              color: theme.palette.text.secondary,
                              width: "18px",
                              marginTop: "4px",
                            }}
                          />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              대표자
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {company.ceoNm}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUsers}
                          style={{
                            color: theme.palette.text.secondary,
                            width: "18px",
                            marginTop: "4px",
                          }}
                        />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            직원 수
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {company.employeeCount}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          style={{
                            color: theme.palette.text.secondary,
                            width: "18px",
                            marginTop: "4px",
                          }}
                        />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            주소
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {company.adres}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faGlobe}
                          style={{
                            color: theme.palette.text.secondary,
                            width: "18px",
                            marginTop: "4px",
                          }}
                        />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            웹사이트
                          </Typography>
                          <MuiLink
                            href={
                              company.homepage &&
                              company.homepage.startsWith("http")
                                ? company.homepage
                                : `http://${company.homepage}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body1"
                            sx={{ fontWeight: 500 }}
                          >
                            {company.homepage}
                          </MuiLink>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  회사 정보를 불러올 수 없습니다.
                </Typography>
              )}
            </Paper>
            {/* Description */}
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
                  sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}
                >
                  {jobPosting.description}
                </Typography>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default JobPostingDetailPage;
