'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
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
  ClickAwayListener,
} from '@mui/material';
import CustomCalendar from '@/components/calendar.js'; // CustomCalendar 컴포넌트 임포트

// 선택 가능한 지역 목록 (하드코딩)
const availableRegions = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

export default function CalendarPage() {
  const [jobPostings, setJobPostings] = useState([]);
  const [empEvents, setEmpEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]); // 선택된 지역
  const [tempSelectedRegions, setTempSelectedRegions] = useState([]); // Popover 내 임시 선택 지역
  const [anchorEl, setAnchorEl] = useState(null); // Popover를 띄울 기준 요소

  const fetchCalendarData = useCallback(async (regions) => {
    setLoading(true);
    setError(null);
    try {
      const [jobPostingsRes, empEventsRes] = await Promise.all([
        axios.get('/api/calendar/job-postings'),
        axios.get('/api/calendar/emp-events', { params: { regions: regions.join(',') } }), // 지역 필터링 파라미터 추가
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

  useEffect(() => {
    fetchCalendarData(selectedRegions);
  }, [fetchCalendarData, selectedRegions]);

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
    ...jobPostings.map(job => ({
      id: `job-${job.id}`,
      title: `${job.title} (${job.companyName})`,
      start: job.start,
      end: job.end,
      allDay: job.allDay,
      color: '#42a5f5', // Job Posting color (blue)
      type: job.type,
      extendedProps: { status: getEventStatus(job.start, job.end) }, // Add status for icon rendering
    })),
    ...(selectedRegions.length > 0 // 선택된 지역이 있을 때만 empEvents 표시
      ? empEvents.map(event => ({
          id: `event-${event.id}`,
          title: `${event.title} (${event.area})`,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          color: '#ff7043', // Emp Event color (orange)
          type: event.type,
          extendedProps: { status: getEventStatus(event.start, event.end) }, // Add status for icon rendering
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          캘린더 데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>채용 캘린더</Typography>
      <Button
        variant="outlined"
        onClick={handleOpenRegionPopover}
        sx={{ mb: 2 }}
      >
        채용 행사 지역 선택 ({selectedRegions.length > 0 ? selectedRegions.join(', ') : '지역 선택'})
      </Button>

      <Popover // Dialog 대신 Popover 사용
        open={isRegionDialogOpen}
        anchorEl={anchorEl} // 버튼 요소를 기준으로 팝오버 위치 지정
        onClose={handleCloseRegionPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ maxHeight: 300, overflow: 'auto' }}> {/* Popover 내용 감싸기 */}
          <List>
            {availableRegions.map((region) => (
              <ListItem key={region} disablePadding>
                <ListItemButton role={undefined} onClick={handleRegionToggle(region)} dense>
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
          <DialogActions> {/* DialogActions는 Popover에서도 사용 가능 */}
            <Button onClick={handleRegionCancel}>취소</Button>
            <Button onClick={() => setTempSelectedRegions([])}>전체 선택 해제</Button> {/* 전체 선택 해제 버튼 */}
            <Button onClick={handleRegionApply} variant="contained">적용</Button>
          </DialogActions>
        </Paper>
      </Popover>

      <CustomCalendar events={events} />
    </Box>
  );
}