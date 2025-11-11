"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Popover,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Alert,
  CircularProgress,
  DialogActions,
} from "@mui/material";
import CustomCalendar from "@/components/calendar.js"; // CustomCalendar 컴포넌트 임포트
import { pink } from "@mui/material/colors";
import useAuthStore from "@/store/authStore"; // useAuthStore 임포트 추가

// 선택 가능한 지역 목록 (하드코딩)
const availableRegions = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

export default function CalendarPage() {
  const [jobPostings, setJobPostings] = useState([]);
  const [empEvents, setEmpEvents] = useState([]);
  const [likedJobPostings, setLikedJobPostings] = useState([]); // 관심 기업 채용 공고 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false); // 지역 선택 Popover의 가시성과 위치를 제어
  const [selectedRegions, setSelectedRegions] = useState([]); // 선택된 지역
  const [tempSelectedRegions, setTempSelectedRegions] = useState([]); // Popover 내 임시 선택 지역
  const [anchorEl, setAnchorEl] = useState(null); // Popover를 띄울 기준 요소
  const [showLikedCompanies, setShowLikedCompanies] = useState(false); // 관심기업 표시 여부 상태 추가

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore(); // useAuthStore에서 user, isAuthenticated, isAuthLoading 가져오기

  const fetchCalendarData = useCallback(async (regions) => {
    setLoading(true);
    setError(null);
    try {
      const [jobPostingsRes, empEventsRes] = await Promise.all([
        axios.get("/api/calendar/job-postings"),
        axios.get("/api/calendar/emp-events", {
          params: { regions: regions.join(",") },
        }), // 지역 필터링 파라미터 추가
      ]);
      setJobPostings(jobPostingsRes.data);
      setEmpEvents(empEventsRes.data);
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
      setError("캘린더 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 관심 기업 채용 공고를 불러오는 함수
  const fetchLikedCompanyJobPostings = useCallback(async () => {
    setLoading(true);
    setError(null);
    // user 객체에 p_user_idx 또는 puserIdx 필드가 있는지 확인
    if (!isAuthenticated || (!user?.p_user_idx && !user?.puserIdx)) {
      // user.id 대신 p_user_idx 또는 puserIdx 확인
      setError("로그인 정보가 없습니다. 관심 기업 정보를 불러올 수 없습니다.");
      setLoading(false);
      return;
    }

    // user.id 대신 user.p_user_idx 사용
    const pUserIdx = user.p_user_idx || user.puserIdx; // 둘 중 하나를 사용

    try {
      // 1. 관심 기업 ID 목록 가져오기
      const companyIdsRes = await axios.get("/api/company-alarms/me/ids", {
        headers: {
          // 인증 토큰 등이 필요하다면 여기에 추가
          // Authorization: `Bearer ${yourAuthToken}`, // HttpOnly 쿠키 방식이므로 필요 없을 가능성 높음
        },
      });
      const companyIds = companyIdsRes.data;

      if (companyIds && companyIds.length > 0) {
        // 2. 관심 기업 ID 목록으로 채용 공고 가져오기
        const likedJobPostingsRes = await axios.get(
          "/api/job-postings/by-companies",
          {
            params: { companyIds: companyIds.join(",") },
            headers: {
              // 인증 토큰 등이 필요하다면 여기에 추가
              // Authorization: `Bearer ${yourAuthToken}`, // HttpOnly 쿠키 방식이므로 필요 없을 가능성 높음
            },
          }
        );
        setLikedJobPostings(likedJobPostingsRes.data);
      } else {
        setLikedJobPostings([]);
      }
    } catch (err) {
      console.error("Failed to fetch liked company job postings:", err);
      setError("관심 기업 채용 공고를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.p_user_idx, user?.puserIdx]); // 의존성 배열도 user.id 대신 p_user_idx 또는 puserIdx로 변경

  useEffect(() => {
    fetchCalendarData(selectedRegions);
  }, [fetchCalendarData, selectedRegions]);

  // "관심기업" 버튼 클릭 핸들러
  const handleToggleLikedCompanies = () => {
    if (!isAuthenticated) {
      // 로그인 상태가 아니면 경고 메시지 표시
      setError("관심 기업 정보를 보려면 로그인해야 합니다.");
      return;
    }
    if (!showLikedCompanies) {
      fetchLikedCompanyJobPostings(); // 관심기업 공고 불러오기
    }
    setShowLikedCompanies(!showLikedCompanies); // 상태 토글
  };

  // Helper function to determine event status based on dates
  const getEventStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today > end) {
      return "past";
    } else if (today >= start && today <= end) {
      return "ongoing";
    } else if (today < start) {
      return "upcoming";
    }
    return "default";
  };

  // FullCalendar 이벤트 형식으로 데이터 변환
  const events = [
    ...jobPostings.map((job) => ({
      id: `job-${job.id}`,
      title: job.companyName,
      start: job.start,
      allDay: job.allDay,
      backgroundColor: "transparent",
      textColor: "#000000",
      borderColor: "transparent",
      type: job.type,
      extendedProps: { status: getEventStatus(job.start, job.end) }, // Add status for icon rendering
    })),
    ...(selectedRegions.length > 0
      ? empEvents.map((event) => ({
          id: `event-${event.id}`,
          title: event.area,
          start: event.start,
          allDay: event.allDay,
          backgroundColor: "transparent",
          textColor: "#000000",
          borderColor: "transparent",
          type: event.type,
          extendedProps: { status: getEventStatus(event.start, event.end) }, // Add status for icon rendering
        }))
      : []),
    ...(showLikedCompanies // 관심기업 표시 상태가 true일 때만 추가
      ? likedJobPostings.map((job) => ({
          id: `liked-job-${job.id}`,
          title: `❤️ ${job.companyName}`, // 하트 아이콘 추가
          start: job.startDate, // 백엔드에서 startDate로 넘어온다고 가정
          end: job.endDate, // 백엔드에서 endDate로 넘어온다고 가정
          allDay: true, // 필요에 따라 조정
          backgroundColor: pink[500], // 하트 색상
          textColor: "#ffffff", // 텍스트 색상
          borderColor: pink[500], // 테두리 색상
          type: "likedJob",
          extendedProps: { status: getEventStatus(job.startDate, job.endDate) },
        }))
      : []),
  ];

  const handleRegionToggle = (region) => () => {
    const currentIndex = tempSelectedRegions.indexOf(region);
    const newChecked = [...tempSelectedRegions];

    if (currentIndex === -1) {
      newChecked.push(region);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setTempSelectedRegions(newChecked);
  };

  const handleOpenRegionPopover = (event) => {
    setAnchorEl(event.currentTarget); // 버튼 요소를 anchorEl로 설정
    setTempSelectedRegions(selectedRegions); // 현재 선택된 지역을 임시 상태로 복사
    setIsRegionDialogOpen(true);
  };

  const handleCloseRegionPopover = () => {
    setIsRegionDialogOpen(false);
    // Popover 닫을 때 임시 선택 상태를 원래대로 복원하지 않음 (취소 버튼에서만 복원)
  };

  const handleRegionApply = () => {
    setSelectedRegions(tempSelectedRegions);
    setIsRegionDialogOpen(false);
  };

  const handleRegionCancel = () => {
    setTempSelectedRegions(selectedRegions); // 취소 시 이전 선택 상태로 복원
    setIsRegionDialogOpen(false);
  };

  if (isAuthLoading || loading) {
    // 인증 로딩 상태도 함께 고려
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {isAuthLoading
            ? "인증 정보를 확인 중..."
            : "캘린더 데이터를 불러오는 중..."}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        채용 캘린더
      </Typography>
      <Button
        variant="outlined"
        onClick={handleOpenRegionPopover}
        sx={{ mb: 2 }}
      >
        채용 행사(
        {selectedRegions.length > 0 ? selectedRegions.join(", ") : "지역 선택"})
      </Button>
      <Button
        variant="contained"
        onClick={handleToggleLikedCompanies} // 클릭 이벤트 핸들러 추가
        style={{
          backgroundColor: showLikedCompanies ? pink[500] : "white", // 상태에 따라 배경색 변경
          color: showLikedCompanies ? "#ffffff" : pink[500], // 상태에 따라 텍스트 색상 변경
        }}
        sx={{
          border: "1px solid #E91E63",
          borderRadius: "13px",
          mb: 2,
          ml: 2,
        }}
      >
        관심기업
      </Button>

      <Popover // Dialog 대신 Popover 사용
        open={isRegionDialogOpen}
        anchorEl={anchorEl} // 버튼 요소를 기준으로 팝오버 위치 지정
        onClose={handleCloseRegionPopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Paper sx={{ maxHeight: 300, overflow: "auto" }}>
          {" "}
          {/* Popover 내용 감싸기 */}
          <List>
            {availableRegions.map((region) => (
              <ListItem key={region} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleRegionToggle(region)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={tempSelectedRegions.indexOf(region) !== -1}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={region} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <DialogActions>
            {" "}
            {/* DialogActions는 Popover에서도 사용 가능 */}
            <Button onClick={handleRegionCancel}>취소</Button>
            <Button onClick={() => setTempSelectedRegions(availableRegions)}>
              전체 선택
            </Button>
            <Button onClick={() => setTempSelectedRegions([])}>
              전체 선택 해제
            </Button>{" "}
            {/* 전체 선택 해제 버튼 */}
            <Button onClick={handleRegionApply} variant="contained">
              적용
            </Button>
          </DialogActions>
        </Paper>
      </Popover>

      <CustomCalendar events={events} />
    </Box>
  );
}
