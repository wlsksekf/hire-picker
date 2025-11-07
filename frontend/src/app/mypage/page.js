"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

// 마이페이지 기본 화면 컴포넌트
function MyPageDefault() {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h5">마이페이지</Typography>
      <Typography variant="body1" color="text.secondary">
        좌측 메뉴를 선택하여 원하시는 정보를 확인하세요.
      </Typography>
    </Box>
  );
}

export default MyPageDefault;
