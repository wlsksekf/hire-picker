"use client";

import { useEffect, useState, use as usePromise } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { getResumeDetail } from "@/api";

const STATUS_CHIP_COLORS = {
  PUBLIC: { bg: "rgba(14,165,233,0.12)", color: "#0284c7" },
  PRIVATE: { bg: "rgba(148,163,184,0.16)", color: "#475569" },
};

const SectionCard = ({ title, children }) => (
  <Box
    sx={{
      backgroundColor: "#ffffff",
      borderRadius: 3,
      border: "1px solid rgba(148,163,184,0.16)",
      boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
      p: { xs: 3, md: 4 },
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const formatDate = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(
      date.getDate()
    ).padStart(2, "0")}일`;
  } catch {
    return "-";
  }
};

const ResumeMarketplaceDetailPage = ({ params }) => {
  const router = useRouter();
  const resolvedParams =
    params && typeof params.then === "function" ? usePromise(params) : params;
  const resumeId = Number(resolvedParams?.id);

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resumeId) {
      setError("유효하지 않은 이력서 식별자입니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getResumeDetail(resumeId)
      .then((detail) => {
        setResume(detail);
        setError("");
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || err?.message || "이력서 정보를 불러오지 못했습니다.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [resumeId]);

  return (
    <Box sx={{ background: "#f1f5f9", minHeight: "100vh", py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
                이력서 열람
              </Typography>
              <Typography sx={{ color: "#64748b" }}>
                거래소에서 구매한 이력서의 상세 정보를 확인할 수 있어요.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => router.back()} sx={{ borderRadius: 2 }}>
              이전 페이지
            </Button>
          </Stack>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 12,
              }}
            >
              <CircularProgress />
              <Typography color="text.secondary">이력서를 불러오는 중입니다…</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : resume ? (
            <Stack spacing={3}>
              <SectionCard title={resume.title || "제목 없는 이력서"}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={`열람 크레딧 ${Number(resume.creditCost || 0).toLocaleString()} C`}
                      sx={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#047857", fontWeight: 700 }}
                    />
                    <Chip
                      label={resume.status === "PUBLIC" ? "공개" : "비공개"}
                      sx={{
                        backgroundColor: STATUS_CHIP_COLORS[resume.status || "PRIVATE"].bg,
                        color: STATUS_CHIP_COLORS[resume.status || "PRIVATE"].color,
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                  <Typography sx={{ color: "#475569", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {resume.selfStrengths || resume.selfGrowth || "자기소개가 등록되지 않았습니다."}
                  </Typography>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                      작성자 정보
                    </Typography>
                    <Typography sx={{ color: "#475569" }}>
                      {resume.personal?.name || "이름 미기재"}
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                      연락처 {resume.personal?.phone || "미등록"} · 이메일 {resume.personal?.email || "미등록"}
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                      주소 {resume.personal?.address || "미등록"}
                    </Typography>
                  </Stack>
                </Stack>
              </SectionCard>

              <SectionCard title="학력">
                <Stack spacing={2}>
                  {(resume.academics || []).length === 0 ? (
                    <Typography color="text.secondary">등록된 학력 정보가 없습니다.</Typography>
                  ) : (
                    resume.academics.map((item, index) => (
                      <Box
                        key={`${item.schoolName}-${index}`}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid rgba(148,163,184,0.18)",
                          p: 2,
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {item.schoolName || "학교명 미기재"}
                        </Typography>
                        <Typography sx={{ color: "#475569", fontSize: 14 }}>
                          {item.degree || "학위 정보 없음"} · {item.major || "전공 정보 없음"}
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                          {formatDate(item.admissionDate)} ~ {formatDate(item.graduationDate)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              </SectionCard>

              <SectionCard title="경력">
                <Stack spacing={2}>
                  {(resume.experiences || []).length === 0 ? (
                    <Typography color="text.secondary">등록된 경력 정보가 없습니다.</Typography>
                  ) : (
                    resume.experiences.map((item, index) => (
                      <Box
                        key={`${item.companyName}-${index}`}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid rgba(148,163,184,0.18)",
                          p: 2,
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {item.companyName || "회사명 미기재"}
                        </Typography>
                        <Typography sx={{ color: "#475569", fontSize: 14 }}>
                          {item.department || "부서 미기재"} · {item.position || "직책 미기재"}
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                          {formatDate(item.hireDate)} ~{" "}
                          {item.resignDate ? formatDate(item.resignDate) : "재직중"}
                        </Typography>
                        <Typography sx={{ color: "#475569", mt: 1, fontSize: 14 }}>
                          {item.mainDuties || item.jobDescription || "직무 내용 미기재"}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              </SectionCard>

              <SectionCard title="지원 동기 & 포부">
                <Stack spacing={2}>
                  <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>지원 동기</Typography>
                  <Typography sx={{ color: "#475569", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {resume.selfMotivation || "지원 동기가 등록되지 않았습니다."}
                  </Typography>
                  <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>향후 포부</Typography>
                  <Typography sx={{ color: "#475569", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {resume.selfAspirations || "포부가 등록되지 않았습니다."}
                  </Typography>
                </Stack>
              </SectionCard>
            </Stack>
          ) : (
            <Alert severity="info">이력서 정보를 찾을 수 없습니다.</Alert>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default ResumeMarketplaceDetailPage;

