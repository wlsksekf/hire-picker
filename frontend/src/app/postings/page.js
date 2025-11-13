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
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@mui/material/styles";
import ChatRoom from "@/components/ChatRoom";
import SearchFilterBar from "@/components/SearchFilterBar";
import Bookmark from "@/components/BookMark";
import JobDetailModal from "@/components/JobDetailModal";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation"; // Import useSearchParams and useRouter

const PAGE_SIZE = 18;

function PostingsPage() {
  const theme = useTheme();
  const searchParams = useSearchParams(); // Initialize useSearchParams
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null); // 상세 공고 모달용

  // Initialize state with query parameters
  const initialSearchTerm = searchParams.get("searchTerm") || "";
  const initialFilters = {
    jobType: searchParams.get("jobType")?.split(",") || [],
    location: searchParams.get("location")?.split(",") || [],
    employmentType: searchParams.get("employmentType")?.split(",") || [],
    experienceLevel: searchParams.get("experienceLevel")?.split(",") || [],
    companyType: searchParams.get("companyType")?.split(",") || [],
  };

  const [appliedSearchTerm, setAppliedSearchTerm] = useState(initialSearchTerm);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  function fetchJobs(pageNum, searchTerm, filters) {
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
        setStatus("success");
      })
      .catch(function (err) {
        setError(err);
        setStatus("error");
      })
      .finally(function () {
        setIsFetchingNextPage(false);
      });
  }

  useEffect(
    function () {
      // Use initial values from URL for the first fetch
      fetchJobs(0, initialSearchTerm, initialFilters);
    },
    [searchParams]
  ); // Re-fetch when searchParams change

  function handleSearchAndFilter(term, filters, responseData) {
    setAppliedSearchTerm(term);
    setAppliedFilters(filters);
    setPage(0);

    if (responseData && responseData.content) {
      setJobs(responseData.content);
      setHasNextPage(responseData.last === false);
      setStatus("success");
    } else {
      setJobs([]);
      setHasNextPage(false);
      setStatus("success");
    }
  }

  function fetchNextPage() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, appliedSearchTerm, appliedFilters);
  }

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
      <Box sx={{ pb: 3 }}>
        <SearchFilterBar
          onSearchAndFilter={handleSearchAndFilter}
          initialSearchTerm={appliedSearchTerm}
          initialFilters={appliedFilters}
        />

        {/* Grid container로 3열 설정 */}
        <Grid container rowSpacing={3} columnSpacing={3} alignItems="stretch">
          {" "}
          {/* alignItems="stretch" 명시 */}
          {jobs.map(function (job) {
            return (
              <Grid
                key={job.postingIdx || `${job.companyName}-${job.title}`}
                size={{ xs: 12, sm: 6, md: 4 }}
              >
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "background-color 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover, // 살짝 빛나는 느낌
                      boxShadow: "0 6px 16px rgba(0,0,0,0.1)", // 약간 그림자 강조
                    },
                    display: "flex", // Card를 flex 컨테이너로 만들고
                    flexDirection: "column", // 내부 콘텐츠를 세로로 배치
                    height: "100%", // Card가 Grid 아이템의 높이를 꽉 채우도록
                  }}
                >
                  {/* 이미지 부분은 Flex로 설정하여 크기를 유지 */}
                  <Link
                    href={`/postings/${job.postingIdx}`}
                    passHref
                    style={{ textDecoration: "none" }}
                  >
                    <Box
                      sx={{
                        height: "180px", // 이미지 높이를 고정
                        backgroundImage: job.imgUrl
                          ? `url(/${job.imgUrl})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: theme.palette.grey[200],
                        flexShrink: 0, // 이미지 부분이 줄어들지 않도록
                      }}
                    />
                  </Link>

                  {/* 카드 본문 부분 */}
                  <Box
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      flexGrow: 1, // 남은 공간을 채우도록 설정
                      overflow: "hidden", // 콘텐츠가 넘칠 경우 숨김
                    }}
                  >
                    <Link href={`/postings/${job.postingIdx}`} passHref>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography color="text.secondary" noWrap>
                          {job.companyName}
                        </Typography>
                        {job.status && (
                          <Chip
                            label={job.status === "OPEN" ? "지원가능" : "마감"}
                            size="small"
                            sx={{
                              ml: 1,
                              fontWeight: 600,
                              bgcolor:
                                job.status === "OPEN"
                                  ? theme.palette.success.light
                                  : theme.palette.error.light,
                              color: theme.palette.common.white,
                            }}
                          />
                        )}
                      </Box>
                    </Link>

                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flexShrink: 0, // 타이틀이 줄어들지 않도록
                      }}
                    >
                      {job.title}
                    </Typography>
                    {/* 카드 하단 버튼들 */}
                    <CardActions
                      sx={{
                        mt: "auto",
                        justifyContent: "flex-end",
                        flexShrink: 0,
                      }}
                    >
                      {" "}
                      {/* mt: "auto"로 하단에 붙이고, 줄어들지 않도록 */}
                      <Box onClick={(e) => e.stopPropagation()}>
                        <Bookmark jobId={job.postingIdx} />
                      </Box>
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(job);
                        }}
                      >
                        실시간 채팅
                      </Button>
                      <Button
                        variant="contained"
                        href={job.homepageUrl}
                        target="_blank"
                        disabled={!job.homepageUrl}
                        onClick={(e) => e.stopPropagation()}
                      >
                        지원하기
                      </Button>
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* 페이지네이션 */}
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
    </Container>
  );
}

export default PostingsPage;
