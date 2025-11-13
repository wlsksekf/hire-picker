"use client";

import React from "react";
import {
  Typography,
  Box,
  Paper,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const RequiredQualifications = ({ qualifications }) => {
  const theme = useTheme();
  if (!qualifications) return null;

  // Split by common delimiters (including newline) and filter out empty strings
  const items = qualifications
    .split(/,|\/|·|\\s+및\\s+|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        채용 필수사항
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ mt: 2 }}>
        <Stack spacing={1.5}>
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
            >
              <FontAwesomeIcon
                icon={faCheck}
                style={{
                  color: theme.palette.success.main,
                  width: "18px",
                  marginTop: "5px",
                }}
              />
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ flex: 1 }}
              >
                {item}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default RequiredQualifications;
