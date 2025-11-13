import {
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Pagination, // Pagination 임포트 추가
  PaginationItem, // PaginationItem 임포트 추가
} from "@mui/material";
import { MINT_PRIMARY_DARK } from "../adminTheme";
import { useEffect, useState } from "react";
import axios from "axios"; // axios 임포트 추가

export default function JobManagementTab() {
  const [jobPostings, setJobPostings] = useState([]);
  const [empEvents, setEmpEvents] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);

  // 채용 공고 페이징 상태
  const [currentPageJobs, setCurrentPageJobs] = useState(0); // 0-based
  const [totalPagesJobs, setTotalPagesJobs] = useState(0);
  const JOB_PAGE_SIZE = 10;

  // 채용 행사 페이징 상태
  const [currentPageEvents, setCurrentPageEvents] = useState(0); // 0-based
  const [totalPagesEvents, setTotalPagesEvents] = useState(0);
  const EVENT_PAGE_SIZE = 10;

  const fetchJobPostings = async (page = 0) => {
    try {
      setLoadingJobs(true);
      const response = await axios.get(`/api/job-postings/all`, {
        params: { page, size: JOB_PAGE_SIZE, sort: "regDate,desc" },
        withCredentials: true,
      });
      setJobPostings(response.data.content);
      setTotalPagesJobs(response.data.totalPages);
      setCurrentPageJobs(page);
      console.log("Job Postings:", response.data.content);
    } catch (error) {
      setErrorJobs("채용 공고를 불러오는 데 실패했습니다.");
      console.error(error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchEmpEvents = async (page = 0) => {
    try {
      setLoadingEvents(true);
      const response = await axios.get(`/api/manage/emp-events`, {
        params: { page, size: EVENT_PAGE_SIZE },
      });
      setEmpEvents(response.data.content);
      setTotalPagesEvents(response.data.totalPages);
      setCurrentPageEvents(page);
      console.log("Emp Events:", response.data.content);
    } catch (error) {
      setErrorEvents("채용 행사를 불러오는 데 실패했습니다.");
      console.error(error);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchJobPostings();
    fetchEmpEvents();
  }, []);

  const handlePageChangeJobs = (event, value) => {
    fetchJobPostings(value - 1); // Pagination은 1-based, API는 0-based
  };

  const handlePageChangeEvents = (event, value) => {
    fetchEmpEvents(value - 1); // Pagination은 1-based, API는 0-based
  };

  const handleCloseJobPosting = async (postingIdx) => {
    if (window.confirm("정말로 이 채용 공고를 마감하시겠습니까?")) {
      try {
        await axios.put(
          `/api/job-postings/${postingIdx}/status`,
          {},
          { withCredentials: true }
        );
        alert("채용 공고가 성공적으로 마감되었습니다.");
        fetchJobPostings(); // 목록 새로고침
      } catch (error) {
        alert("채용 공고 마감에 실패했습니다.");
        console.error("Error closing job posting:", error);
      }
    }
  };

  const handleCloseEmpEvent = async (eventIdx) => {
    if (window.confirm("정말로 이 채용 행사를 마감하시겠습니까?")) {
      try {
        await axios.put(
          `/api/manage/emp-events/${eventIdx}/status`,
          {},
          { withCredentials: true }
        );
        alert("채용 행사가 성공적으로 마감되었습니다.");
        fetchEmpEvents(); // 목록 새로고침
      } catch (error) {
        alert("채용 행사 마감에 실패했습니다.");
        console.error("Error closing employment event:", error);
      }
    }
  };

  const PAGE_GROUP_SIZE = 5; // 한 번에 보여줄 페이지 번호 개수

  const renderPaginationItems = (
    item,
    currentPage,
    totalPages,
    handlePageChange
  ) => {
    const currentGroupIndex = Math.floor(currentPage / PAGE_GROUP_SIZE);
    const startPageOfCurrentGroup = currentGroupIndex * PAGE_GROUP_SIZE;
    const endPageOfCurrentGroup = Math.min(
      startPageOfCurrentGroup + PAGE_GROUP_SIZE - 1,
      totalPages - 1
    );

    if (item.type === "page") {
      const pageNumber = item.page - 1; // 0-based
      if (
        pageNumber >= startPageOfCurrentGroup &&
        pageNumber <= endPageOfCurrentGroup
      ) {
        return (
          <PaginationItem
            {...item}
            onClick={(e) => handlePageChange(e, item.page)} // 1-based 페이지 번호 전달
          />
        );
      }
      return null;
    } else if (item.type === "previous") {
      const targetPage = Math.max(0, startPageOfCurrentGroup - PAGE_GROUP_SIZE);
      return (
        <PaginationItem
          {...item}
          onClick={(e) => handlePageChange(e, targetPage + 1)} // 1-based 페이지 번호 전달
          disabled={currentGroupIndex === 0} // 첫 페이지 그룹에서는 이전 버튼 비활성화
        />
      );
    } else if (item.type === "next") {
      const nextGroupStartPage = startPageOfCurrentGroup + PAGE_GROUP_SIZE;
      return (
        <PaginationItem
          {...item}
          onClick={(e) => handlePageChange(e, nextGroupStartPage + 1)} // 1-based 페이지 번호 전달
          disabled={nextGroupStartPage >= totalPages} // 다음 그룹이 없으면 다음 버튼 비활성화
        />
      );
    } else if (item.type === "start-ellipsis" || item.type === "end-ellipsis") {
      return null; // ...은 렌더링하지 않음
    }
    return <PaginationItem {...item} />; // 기타 타입 (first, last 등)은 기본 렌더링
  };

  return (
    <Stack spacing={4}>
      {/* 공고 관리 섹션 */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          boxShadow: "0 18px 32px -30px rgba(17,24,39,0.3)",
          background: "#ffffff",
          border: "1px solid rgba(17,24,39,0.06)",
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700} color="#111827">
              공고 관리
            </Typography>
            {/* "공고 새로 만들기" 버튼 제거 */}
          </Stack>

          {loadingJobs ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: 200 }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" mt={2}>
                채용 공고를 불러오는 중...
              </Typography>
            </Stack>
          ) : errorJobs ? (
            <Alert severity="error">{errorJobs}</Alert>
          ) : jobPostings.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}
            >
              등록된 채용 공고가 없습니다.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {jobPostings.map((job) => (
                <Paper
                  key={job.postingIdx}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 2.5,
                    borderColor: "rgba(17,24,39,0.08)",
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="#111827"
                      >
                        {job.title}
                      </Typography>
                      <Chip
                        label={job.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: "#e5e7eb",
                          color: "#1f2937",
                        }}
                      />
                    </Stack>
                    <Typography variant="body2" color="#6b7280">
                      {job.companyName}
                    </Typography>
                    <Stack
                      direction="row"
                      justifyContent="flex-end" // 오른쪽 정렬
                      alignItems="center"
                    >
                      <Button
                        size="small"
                        sx={{ textTransform: "none", color: MINT_PRIMARY_DARK }}
                        onClick={() => handleCloseJobPosting(job.postingIdx)}
                      >
                        마감
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
              {totalPagesJobs > 1 && (
                <Pagination
                  count={totalPagesJobs}
                  page={currentPageJobs + 1}
                  onChange={handlePageChangeJobs}
                  color="primary"
                  sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                  renderItem={(item) =>
                    renderPaginationItems(
                      item,
                      currentPageJobs,
                      totalPagesJobs,
                      handlePageChangeJobs
                    )
                  }
                />
              )}
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* 채용 행사 관리 섹션 */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          boxShadow: "0 18px 32px -30px rgba(17,24,39,0.3)",
          background: "#ffffff",
          border: "1px solid rgba(17,24,39,0.06)",
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700} color="#111827">
              채용 행사 관리
            </Typography>
            {/* "행사 새로 만들기" 버튼 제거 */}
          </Stack>

          {loadingEvents ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: 200 }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" mt={2}>
                채용 행사를 불러오는 중...
              </Typography>
            </Stack>
          ) : errorEvents ? (
            <Alert severity="error">{errorEvents}</Alert>
          ) : empEvents.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}
            >
              등록된 채용 행사가 없습니다.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {empEvents.map((event) => (
                <Paper
                  key={event.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 2.5,
                    borderColor: "rgba(17,24,39,0.08)",
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="#111827"
                      >
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.eventStatus}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: "#e5e7eb",
                          color: "#1f2937",
                        }}
                      />
                    </Stack>
                    <Typography variant="body2" color="#6b7280">
                      행사 번호: {event.id}
                    </Typography>
                    <Typography variant="body2" color="#6b7280">
                      기간: {event.period}
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="flex-end" // 오른쪽 정렬
                      alignItems="center"
                    >
                      <Button
                        size="small"
                        sx={{ textTransform: "none", color: MINT_PRIMARY_DARK }}
                        onClick={() => handleCloseEmpEvent(event.id)}
                      >
                        마감
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
              {totalPagesEvents > 1 && (
                <Pagination
                  count={totalPagesEvents}
                  page={currentPageEvents + 1}
                  onChange={handlePageChangeEvents}
                  color="primary"
                  sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                  renderItem={(item) =>
                    renderPaginationItems(
                      item,
                      currentPageEvents,
                      totalPagesEvents,
                      handlePageChangeEvents
                    )
                  }
                />
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
