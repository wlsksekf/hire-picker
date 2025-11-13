import {
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  TextField, // TextField 임포트 추가
} from "@mui/material";
import { MINT_PRIMARY_DARK } from "../adminTheme";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"; // 백엔드 API 기본 URL

export default function EventManagementTab() {
  const [empEvents, setEmpEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가

  // 채용 행사 페이징 상태
  const [currentPageEvents, setCurrentPageEvents] = useState(0); // 0-based
  const [totalPagesEvents, setTotalPagesEvents] = useState(0);
  const EVENT_PAGE_SIZE = 10;

  const fetchEmpEvents = async (page = 0, search = "") => {
    try {
      setLoadingEvents(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/manage/emp-events`,
        {
          params: { page, size: EVENT_PAGE_SIZE, search }, // search 파라미터 추가
          withCredentials: true,
        }
      );
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
    const handler = setTimeout(() => {
      fetchEmpEvents(0, searchQuery); // 검색어 변경 시 첫 페이지부터 검색
    }, 500); // 500ms 디바운스

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); // searchQuery가 변경될 때마다 실행

  const handlePageChangeEvents = (event, value) => {
    fetchEmpEvents(value - 1, searchQuery); // Pagination은 1-based, API는 0-based
  };

  const handleUpdateEmpEventStatus = async (eventId, newStatus) => {
    const confirmMessage =
      newStatus === "CLOSED"
        ? "정말로 이 채용 행사를 마감하시겠습니까?"
        : "정말로 이 채용 행사를 재개하시겠습니까?";
    const successMessage =
      newStatus === "CLOSED"
        ? "채용 행사가 성공적으로 마감되었습니다."
        : "채용 행사가 성공적으로 재개되었습니다.";
    const errorMessage =
      newStatus === "CLOSED"
        ? "채용 행사 마감에 실패했습니다."
        : "채용 행사 재개에 실패했습니다.";

    if (window.confirm(confirmMessage)) {
      try {
        await axios.put(
          `${API_BASE_URL}/api/manage/emp-events/${eventId}/status`,
          null, // RequestBody가 없으므로 null 전달
          {
            params: { newStatus: newStatus }, // 쿼리 파라미터로 newStatus 전달
            withCredentials: true,
          }
        );
        alert(successMessage);
        fetchEmpEvents(currentPageEvents, searchQuery); // 목록 새로고침 시 현재 페이지와 검색어 유지
      } catch (error) {
        alert(errorMessage);
        console.error("Error updating employment event status:", error);
      }
    }
  };

  return (
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
        <TextField
          label="채용 행사 제목 또는 번호 검색"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

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
                    {event.eventStatus === "CLOSED" ? (
                      <Button
                        size="small"
                        sx={{ textTransform: "none", color: MINT_PRIMARY_DARK }}
                        onClick={() =>
                          handleUpdateEmpEventStatus(event.id, "OPEN")
                        }
                      >
                        재개
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        sx={{ textTransform: "none", color: MINT_PRIMARY_DARK }}
                        onClick={() =>
                          handleUpdateEmpEventStatus(event.id, "CLOSED")
                        }
                      >
                        마감
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
            <Pagination
              count={totalPagesEvents}
              page={currentPageEvents + 1}
              onChange={handlePageChangeEvents}
              color="primary"
              sx={{ mt: 3, display: "flex", justifyContent: "center" }}
              siblingCount={2} // 현재 페이지 양쪽에 표시할 페이지 번호 개수
              boundaryCount={1} // 시작과 끝에 표시할 페이지 번호 개수
            />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
