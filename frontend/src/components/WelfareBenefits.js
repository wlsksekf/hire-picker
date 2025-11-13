"use client";

import React from "react";
import {
  Typography,
  Box,
  Paper,
  useTheme,
  Stack,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMugHot,
  faBook,
  faHeartbeat,
  faCar,
  faHome,
  faGift,
  faGraduationCap,
  faPlane,
  faHandshake,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const benefitIcons = {
  "4대보험": faHandshake,
  연차: faPlane,
  휴가: faPlane,
  "경조사 지원": faGift,
  "주택자금 지원": faHome,
  "차량유지비 지원": faCar,
  "건강검진": faHeartbeat,
  "교육/훈련 지원": faGraduationCap,
  "도서구입비 지원": faBook,
  "카페테리아": faMugHot,
  // Add more mappings as needed
};

const getIconForBenefit = (benefit) => {
  for (const key in benefitIcons) {
    if (benefit.includes(key)) {
      return benefitIcons[key];
    }
  }
  return faCheck; // Default icon
};

const WelfareBenefits = ({ welfare }) => {
  const theme = useTheme();
  if (!welfare) return null;

  // Split by common delimiters (including newline) and filter out empty strings
  const benefits = welfare
    .split(/,|\/|·|\\s+및\\s+|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        복리후생
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Stack spacing={1.5}>
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
            >
              <FontAwesomeIcon
                icon={getIconForBenefit(benefit)}
                style={{
                  color: theme.palette.primary.main,
                  width: "18px",
                  marginTop: "5px",
                }}
              />
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ flex: 1 }}
              >
                {benefit}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default WelfareBenefits;
