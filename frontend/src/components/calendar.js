"use client";
import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarXmark,
  faCalendarCheck,
  faClock,
  faBullhorn,
  faHeart, // faHeart 임포트 추가
} from "@fortawesome/free-solid-svg-icons";
import { faCalendar as faCalendarRegular } from "@fortawesome/free-regular-svg-icons";
import { pink } from "@mui/material/colors"; // pink 색상 임포트 추가

export default function CustomCalendar({ events }) {
  const calendarRef = useRef();

  const handleSelectDate = (date) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(date.toDate());
  };

  // Custom event content rendering function
  const renderEventContent = (eventInfo) => {
    const status = eventInfo.event.extendedProps.status;
    const type = eventInfo.event.type; // eventInfo.event.extendedProps.type 대신 eventInfo.event.type 사용
    let iconComponent;
    let iconColorHex;

    const getColor = (status) => {
      // 색상별 의미
      switch (status) {
        case "past":
          return "#6B7280"; // 과거 이벤트 (회색)
        case "ongoing":
          return "#10B981"; // 진행 중인 이벤트 (초록색)
        case "upcoming":
          return "#6366F1"; // 예정된 이벤트 (파란색)
        default:
          return "#A78BFA"; // 기본/기타 이벤트 (보라색)
      }
    };

    if (type === "likedJob") {
      // likedJob 타입인 경우 하트 아이콘 표시
      iconComponent = faHeart;
      iconColorHex = pink[500]; // 핑크색 하트
    } else if (type === "empEvent") {
      iconComponent = faBullhorn;
      iconColorHex = getColor(status); // 기존 색상 로직 유지
    } else {
      switch (status) {
        case "past":
          iconComponent = faCalendarXmark;
          break;
        case "ongoing":
          iconComponent = faCalendarCheck;
          break;
        case "upcoming":
          iconComponent = faClock;
          break;
        default:
          iconComponent = faCalendarRegular;
      }
      iconColorHex = getColor(status);
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          paddingLeft: "4px",
        }}
      >
        {iconComponent && (
          <FontAwesomeIcon
            icon={iconComponent}
            style={{ flexShrink: 0, color: iconColorHex, marginRight: "4px" }}
          />
        )}
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flexGrow: 1,
            minWidth: 0, // 이게 필수
          }}
        >
          {eventInfo.timeText && (
            <b style={{ marginRight: "4px" }}>{eventInfo.timeText}</b>
          )}
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardHeader
        action={
          <Tooltip title="날짜 선택">
            <IconButton onClick={() => alert("날짜 선택 기능")}>
              <CalendarToday />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            locale="ko"
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek,dayGridDay",
            }}
            dayHeaderClassNames="fc-daygrid-day-header"
            eventContent={renderEventContent} // Use custom content renderer
          />
        </Box>
      </CardContent>
    </Card>
  );
}
