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
import { calendar } from "/frontend/src/components";

export default function CustomCalendar() {
  const calendarRef = useRef();
  const [events] = useState([
    { title: "공고 마감", date: "2025-11-10" },
    { title: "면접 일정", date: "2025-11-15" },
  ]);

  const handleSelectDate = (date) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.gotoDate(date.toDate());
  };

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardHeader
        title="📅 주요 일정"
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
          />
        </Box>
      </CardContent>
    </Card>
  );
}
