import {
  Button,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import { MINT_PRIMARY_DARK } from "../adminTheme";
import { useState } from "react";
import { api } from "@/api";
import SyncIcon from "@mui/icons-material/Sync";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import DescriptionIcon from "@mui/icons-material/Description";

/**
 * API 동기화 탭 컴포넌트
 * 
 * 관리자가 외부 API로부터 데이터를 동기화하거나 가져올 수 있는 기능 제공
 */
export default function ApiSyncTab() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // GET 요청 동기화 처리
  const handleSync = (name, path) => {
    setLoading(true);
    setStatus({ type: "info", message: `${name} 동기화를 시작합니다...` });

    api
      .get(path)
      .then((response) => {
        const resultData = response.data;
        const resultText =
          typeof resultData === "object"
            ? resultData.message || JSON.stringify(resultData)
            : resultData;
        setStatus({ type: "success", message: resultText });
      })
      .catch((error) => {
        const rawMessage =
          error.response?.data ||
          error.message ||
          `${name} 동기화에 실패했습니다.`;
        const errorMessage =
          typeof rawMessage === "object"
            ? rawMessage.message || JSON.stringify(rawMessage)
            : rawMessage;
        setStatus({ type: "error", message: errorMessage });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // POST 요청 동기화 처리
  const handlePostSync = (name, path) => {
    setLoading(true);
    setStatus({ type: "info", message: `${name} 동기화를 시작합니다...` });

    api
      .post(path)
      .then((response) => {
        const result = response.data;
        const message =
          typeof result === "object"
            ? result.message || JSON.stringify(result)
            : result;
        setStatus({ type: "success", message });
      })
      .catch((error) => {
        const raw =
          error.response?.data ||
          error.message ||
          `${name} 동기화 중 오류가 발생했습니다.`;
        const message =
          typeof raw === "object" ? raw.message || JSON.stringify(raw) : raw;
        setStatus({ type: "error", message });
      })
      .finally(() => setLoading(false));
  };

  // 동기화 버튼 스타일
  const syncButtonStyle = {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    px: 3,
    py: 1.5,
    bgcolor: "white",
    border: "1.5px solid rgba(17,24,39,0.12)",
    color: "#111827",
    "&:hover": {
      bgcolor: `${MINT_PRIMARY_DARK}15`,
      borderColor: MINT_PRIMARY_DARK,
      color: MINT_PRIMARY_DARK,
      boxShadow: `0 0 0 3px ${MINT_PRIMARY_DARK}15`,
    },
    "&:disabled": {
      bgcolor: "#f3f4f6",
      borderColor: "#e5e7eb",
      color: "#9ca3af",
    },
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
      <Stack spacing={4}>
        {/* 헤더 */}
        <Box>
          <Typography variant="h6" fontWeight={700} color="#111827" gutterBottom>
            API 동기화
          </Typography>
          <Typography variant="body2" color="#6b7280">
            외부 API로부터 데이터를 동기화하고 가져올 수 있습니다.
          </Typography>
        </Box>

        {/* 상태 메시지 */}
        {status.message && (
          <Alert
            severity={status.type || "info"}
            sx={{
              borderRadius: 2,
              "& .MuiAlert-icon": {
                color: status.type === "success" ? MINT_PRIMARY_DARK : undefined,
              },
            }}
          >
            {status.message}
          </Alert>
        )}

        {/* 로딩 인디케이터 */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress sx={{ color: MINT_PRIMARY_DARK }} />
          </Box>
        )}

        {/* Work24 API 섹션 */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <WorkIcon sx={{ color: MINT_PRIMARY_DARK }} />
            <Typography variant="subtitle1" fontWeight={700} color="#111827">
              Work24 API
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<WorkIcon />}
                onClick={() => handleSync("공채속보", "/api/work24/sync/jobs")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                공채속보 동기화
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<EventIcon />}
                onClick={() => handleSync("채용행사", "/api/work24/sync/events")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                채용행사 동기화
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<BusinessIcon />}
                onClick={() => handleSync("기업정보", "/api/work24/sync/companies")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                기업정보 동기화
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* 외부 채용 API 섹션 */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <CloudDownloadIcon sx={{ color: MINT_PRIMARY_DARK }} />
            <Typography variant="subtitle1" fontWeight={700} color="#111827">
              외부 채용 API
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<CloudDownloadIcon />}
                onClick={() => handlePostSync("RapidAPI 공고", "/api/work24/sync/rapid-jobs")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                RapidAPI 공고 추가
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<CloudDownloadIcon />}
                onClick={() => handlePostSync("JSearch 공고", "/api/work24/sync/jsearch-jobs")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                JSearch 공고 추가
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* 기타 데이터 동기화 섹션 */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <SyncIcon sx={{ color: MINT_PRIMARY_DARK }} />
            <Typography variant="subtitle1" fontWeight={700} color="#111827">
              기타 데이터 동기화
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<BusinessIcon />}
                onClick={() => handleSync("DART 기업정보", "/api/dart/sync/companies")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                DART 기업정보 동기화
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<DescriptionIcon />}
                onClick={() =>
                  handleSync("CSV 업데이트", "/api/national-pension/sync/update-from-csv")
                }
                disabled={loading}
                sx={syncButtonStyle}
              >
                CSV 정보 업데이트
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<SchoolIcon />}
                onClick={() => handleSync("학교정보", "/api/manage/update/school")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                학교정보 불러오기
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startIcon={<CardMembershipIcon />}
                onClick={() => handleSync("자격증", "/api/manage/update/certification")}
                disabled={loading}
                sx={syncButtonStyle}
              >
                자격증 불러오기
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* 안내 메시지 */}
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            주의사항
          </Typography>
          <Typography variant="body2">
            • 동기화 작업은 시간이 걸릴 수 있으며, 진행 중에는 다른 동기화를 실행할 수 없습니다.
            <br />
            • 대용량 데이터 동기화는 서버에 부하를 줄 수 있으니 주의하세요.
            <br />• 동기화는 기존 데이터를 업데이트하거나 새로운 데이터를 추가합니다.
          </Typography>
        </Alert>
      </Stack>
    </Paper>
  );
}

