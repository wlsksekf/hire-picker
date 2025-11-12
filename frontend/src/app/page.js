"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Card,
  CardActions,
  Snackbar,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@mui/material/styles";
import ChatRoom from "@/components/ChatRoom";
import SearchFilterBar from "@/components/SearchFilterBar";
import Bookmark from "@/components/BookMark";
import JobDetailModal from "@/components/JobDetailModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import ResumeApplyDialog from "@/components/ResumeApplyDialog";

const PAGE_SIZE = 18;

function HomePage() {
  const theme = useTheme();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null); // 상세 공고 모달용

  const [applyDialogJob, setApplyDialogJob] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    jobType: [],
    location: [],
    employmentType: [],
    experienceLevel: [],
    companyType: [],
  });

  const fetchJobs = (pageNum, searchTerm, filters, silent = false) => {
    if (pageNum === 0) {
      setStatus("pending");
      setJobs([]);
    } else {
      setIsFetchingNextPage(true);
    }

    const requestbody = {
      searchTerm: searchTerm || "",
      filters: filters,
    };

    axios
      .post(`/api/search?page=${pageNum}&size=${PAGE_SIZE}`, requestbody)
      .then(function (res) {
        const data = res.data;
        const newJobs = data._embedded
          ? data._embedded.jobDtoList
          : data.content || [];

        setJobs(function (prev) {
          const merged = pageNum === 0 ? newJobs : [...prev, ...newJobs];
          const unique = merged.filter(
            (job, index, self) =>
              index === self.findIndex((j) => j.id === job.id)
          );
          return unique;
        });

        const isLast = data.page
          ? data.page.number >= data.page.totalPages - 1
          : false;
        setHasNextPage(!isLast);
        if (!silent) {
          setStatus("success");
        }
      })
      .catch(function (err) {
        setError(err);
        if (!silent) {
          setStatus("error");
        }
      })
      .finally(function () {
        if (!silent) {
          setIsFetchingNextPage(false);
        }
      });
  };

  useEffect(function () {
    fetchJobs(0, appliedSearchTerm, appliedFilters);
  }, []); // Initial fetch on component mount

  const handleSearchAndFilter = (term, filters, responseData) => {
    // 필터/검색 결과 데이터가 있으면 현재 페이지에서 업데이트
    if (responseData) {
      const newJobs = responseData._embedded
        ? responseData._embedded.jobDtoList
        : responseData.content || [];
      
      setAppliedSearchTerm(term || "");
      setAppliedFilters(filters || {});
      setJobs(newJobs);
      setPage(0);
      
      const isLast = responseData.page
        ? responseData.page.number >= responseData.page.totalPages - 1
        : false;
      setHasNextPage(!isLast);
      setStatus("success");
    } else {
      // 데이터가 없으면 라우터로 이동 (기존 동작 유지)
      const queryParams = new URLSearchParams();
      if (term) queryParams.append("searchTerm", term);
      for (const filterType in filters) {
        if (filters[filterType] && filters[filterType].length > 0) {
          queryParams.append(filterType, filters[filterType].join(","));
        }
      }
      router.push(`/postings?${queryParams.toString()}`);
    }
  };

  function fetchNextPage() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, appliedSearchTerm, appliedFilters, true);
  }

  const handleApplyDialogClose = () => {
    setApplyDialogJob(null);
  };

  const handleApplySuccess = () => {
    setSnackbar({
      open: true,
      message: "성공적으로 지원되었습니다.",
      severity: "success",
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (status === "pending" && jobs.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography>채용 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">
          채용 정보를 가져오는 데 실패했습니다: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Just Pick.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          사람과 기업을 검색하세요
        </Typography>
        <SearchFilterBar onSearchAndFilter={handleSearchAndFilter} />
      </Box>

      <Box sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          전체 채용공고
        </Typography>

        <Grid container spacing={3}>
          {jobs.map(function (job) {
            return (
              <Grid
                key={job.id || `${job.companyName}-${job.title}`}
                size={{ xs: 12, sm: 6, md: 4 }}
              >
                <Card
                  sx={{
                    borderRadius: "16px",
                    height: "100%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "background-color 0.2s, box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Link
                    href={`/postings/${job.postingIdx}`}
                    passHref
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Box
                      sx={{
                        height: "180px",
                        backgroundImage: job.imgUrl
                          ? `url(/${job.imgUrl})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: theme.palette.grey[200],
                        cursor: "pointer",
                      }}
                    />
                    <Box
                      sx={{
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "calc(100% - 180px)",
                        cursor: "pointer",
                      }}
                    >
                      <Typography color="text.secondary" noWrap>
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
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {job.employmentType && (
                          <Chip label={job.employmentType} />
                        )}
                        {job.location && <Chip label={job.location} />}
                        {job.experience_level && (
                          <Chip label={job.experience_level} />
                        )}
                        {job.companyType && <Chip label={job.companyType} />}
                        {job.jobType && <Chip label={job.jobType} />}
                        {job.startDate && job.endDate && (
                          <Chip
                            icon={<FontAwesomeIcon icon={faCalendar} />}
                            label={`${job.startDate} ~ ${job.endDate}`}
                          />
                        )}
                      </Box>
                    </Box>
                  </Link>
                  <CardActions 
                    sx={{ 
                      mt: 2, 
                      justifyContent: "flex-end", 
                      px: 3, 
                      pb: 2,
                      position: 'relative',
                      zIndex: 10
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
                        setSelectedPost(job);
                      }}
                      sx={{ pointerEvents: 'auto' }}
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
                          setApplyDialogJob(job);
                        } else if (job.applyUrl) {
                          // 외부 공고는 지원 링크로 이동
                          const url = job.applyUrl.startsWith('http') 
                            ? job.applyUrl 
                            : `http://${job.applyUrl}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        } else {
                          alert('지원 링크가 제공되지 않았습니다.');
                        }
                      }}
                      disabled={!job.internal && !job.applyUrl}
                      sx={{ 
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 11,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        }
                      }}
                    >
                      지원하기
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          {hasNextPage && (
            <Button onClick={fetchNextPage} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? <CircularProgress size={24} /> : "더보기"}
            </Button>
          )}
        </Box>
      </Box>

      {selectedPost && (
        <ChatRoom post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      <ResumeApplyDialog
        open={Boolean(applyDialogJob)}
        job={applyDialogJob}
        onClose={handleApplyDialogClose}
        onSuccess={handleApplySuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default HomePage;
