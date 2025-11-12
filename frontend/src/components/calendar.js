"use client";
import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth"; // Import multiMonthPlugin
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite"; // FavoriteIcon만 별도로 임포트
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarXmark,
  faCalendarCheck,
  faClock,
  faBullhorn,
  faHeart, // faHeart 임포트 추가 (likedJob 타입 처리용)
} from "@fortawesome/free-solid-svg-icons";
import { faCalendar as faCalendarRegular } from "@fortawesome/free-regular-svg-icons";
import { pink } from "@mui/material/colors"; // pink 색상 임포트 추가

import { useRouter } from "next/navigation"; // useRouter 임포트

export default function CustomCalendar({ events, calendarRef }) {
  const router = useRouter(); // useRouter 초기화
  const [currentView, setCurrentView] = useState("dayGridMonth"); // 현재 뷰 상태 추가

  const handleEventClick = (info) => {
    const { event } = info;
    const customType = event.extendedProps.customType; // customType 사용
    // jobPosting 또는 likedJob 타입의 이벤트만 페이지 이동 처리
    if (customType === "jobPosting" || customType === "likedJob") {
      const postingIdx = event.id; // CalendarPage에서 이미 순수한 ID를 제공한다고 가정

      console.log("Clicked event ID:", event.id);
      console.log("Extracted posting_idx:", postingIdx);
      console.log("Navigating to:", `/postings/${postingIdx}`);
      console.log("Event customType:", customType); // customType 로깅

      router.push(`/postings/${postingIdx}`);
    } else {
      console.log("Event clicked (non-job posting):", event);
    }
  };

  const eventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isLiked = event.extendedProps.isLiked;
    const status = event.extendedProps.status;
    const customType = event.extendedProps.customType; // customType 사용
    let icon;
    let iconColor = "#000000"; // Default color

    // Determine the icon and its color based on event type and status
    switch (
      customType // customType 사용
    ) {
      case "jobPosting":
        icon = faBullhorn;
        break;
      case "empEvent":
        icon = faCalendarRegular;
        break;
      case "likedJob":
        icon = faHeart;
        iconColor = pink[500];
        break;
      default:
        icon = faCalendarRegular;
    }

    // Adjust icon and color based on status for non-liked events
    if (status === "past") {
      icon = faCalendarXmark;
      iconColor = "#9e9e9e"; // Grey for past events
    } else if (status === "ongoing") {
      icon = faCalendarCheck;
      iconColor = "#4caf50"; // Green for ongoing events
    } else if (status === "upcoming") {
      icon = faClock;
      iconColor = "#ff9800"; // Orange for upcoming events
    }

    // If isLiked, override the icon to FavoriteIcon and set its color to pink
    if (isLiked) {
      icon = faHeart; // Use faHeart for consistency with FontAwesome, or FavoriteIcon from MUI
      iconColor = pink[500]; // Change back to pink
    }

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          backgroundColor: "transparent", // Set back to transparent
          color: "#000000", // Always black text
          borderRadius: "4px",
          padding: "2px 4px",
          boxSizing: "border-box",
          cursor: "pointer",
        }}
      >
        {icon &&
          // Conditionally render FavoriteIcon or FontAwesomeIcon
          (isLiked ? (
            <FavoriteIcon sx={{ color: iconColor, fontSize: 14, mr: 0.5 }} />
          ) : (
            <FontAwesomeIcon
              icon={icon}
              style={{ color: iconColor, fontSize: 14, marginRight: 4 }}
            />
          ))}
        <Typography
          variant="caption"
          sx={{
            fontSize: 10,
            fontWeight: "bold",
            color: "#000000", // Set back to black
          }}
        >
          {event.title}
        </Typography>
      </Box>
    );
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, multiMonthPlugin]}
      initialView={currentView} // Use currentView state
      weekends={true}
      events={events}
      eventContent={eventContent}
      eventClick={handleEventClick}
      locale="ko"
      height="auto"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,multiMonthYear", // Add multiMonthYear button
      }}
      viewDidMount={(viewInfo) => {
        setCurrentView(viewInfo.view.type); // Update currentView state when view changes
      }}
      eventDidMount={(info) => {
        // 이벤트가 렌더링된 후 DOM 요소에 접근하여 스타일을 추가할 수 있습니다.
        // 예를 들어, 특정 조건에 따라 배경색을 변경하거나 아이콘을 추가할 수 있습니다.
        // 여기서는 이미 eventContent에서 처리하고 있으므로 추가적인 작업은 필요 없을 수 있습니다.
      }}
    />
  );
}
