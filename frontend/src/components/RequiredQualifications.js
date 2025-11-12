"use client";

import React from "react";
import {
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const RequiredQualifications = ({ qualifications }) => {
  const theme = useTheme();
  if (!qualifications) return null;

  // Split by common delimiters and filter out empty strings
  const items = qualifications
    .split(/,|\/|·|\\s+및\\s+/) // Corrected escaping for regex
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        채용 필수사항
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid item key={index}>
              <Chip
                icon={
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{
                      color: theme.palette.success.main,
                      width: "16px",
                      height: "16px",
                    }}
                  />
                }
                label={item}
                variant="outlined"
                sx={{
                  p: 1.5,
                  fontSize: "0.9rem",
                  borderColor: theme.palette.divider,
                  "& .MuiChip-icon": {
                    marginLeft: "8px",
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default RequiredQualifications;
