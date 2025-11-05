"use client";

import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  Container,
  Paper,
  Snackbar,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";

export default function ReviewPage() {
  console.log("ReviewPage component rendered");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [review, setReview] = useState("");
  const [reviewerType, setReviewerType] = useState("CURRENT"); // Default to 현직원
  const [reviewIdx, setReviewIdx] = useState(null); // New state for reviewIdx
  const [isEditing, setIsEditing] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

      useEffect(() => {

        console.log("useEffect triggered. isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "user:", user);

        if (!isLoading && !isAuthenticated) {

          console.log("User not authenticated and not loading. Returning.");

          // router.push("/login"); // Redirect to login if not authenticated

          return;

        }

        if (user) {

          console.log("User object is present. Calling fetchCompanies.");

          const fetchCompanies = async () => {

            const token = user?.accessToken;

            console.log("Inside fetchCompanies. Token:", token ? "Present" : "Missing");

            if (!token) {

              setSnackbarSeverity("error");

              setSnackbarMessage("인증 토큰을 찾을 수 없습니다. 다시 로그인해주세요.");

              setSnackbarOpen(true);

              return;

            }

            try {

              const response = await fetch("/api/reviews/companies", {

                headers: {

                  Authorization: `Bearer ${token}`,

                },

              });

              if (response.ok) {

                const data = await response.json();

                setCompanies(data);

              } else {

                setSnackbarSeverity("error");

                setSnackbarMessage("기업 목록을 불러오는데 실패했습니다.");

                setSnackbarOpen(true);

              }

            } catch (error) {

              console.error("Failed to fetch companies:", error);

              setSnackbarSeverity("error");

              setSnackbarMessage("기업 목록을 불러오는 중 오류가 발생했습니다.");

              setSnackbarOpen(true);

            }

          };

    

          fetchCompanies();

        } else {

          console.log("User object is NOT present. fetchCompanies will not be called.");

        }

      }, [isLoading, isAuthenticated, user]);

  const fetchMyReview = async (companyId, pUserIdx) => {
    const token = user?.accessToken; // Get token from auth store
    if (!token) {
      // This case should ideally be handled by the useEffect or router.push("/login")
      // but adding a check here for robustness.
      setSnackbarSeverity("error");
      setSnackbarMessage("인증 토큰을 찾을 수 없습니다. 다시 로그인해주세요.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${companyId}/my-review`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReview(data.review);
        setReviewerType(data.reviewerType);
        setReviewIdx(data.reviewIdx);
        setIsEditing(false); // Existing review, so start in view mode
      } else if (response.status === 404) {
        // No existing review
        setReview("");
        setReviewerType("CURRENT");
        setReviewIdx(null);
        setIsEditing(true); // No existing review, so start in edit mode
      } else {
        setSnackbarSeverity("error");
        setSnackbarMessage("리뷰 정보를 불러오는데 실패했습니다.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch my review:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("리뷰 정보를 불러오는 중 오류가 발생했습니다.");
      setSnackbarOpen(true);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    if (user && company) {
      fetchMyReview(company.companyIdx, user.id); // Fetch review for selected company and user
    } else {
      setReview("");
      setReviewerType("CURRENT");
      setReviewIdx(null);
      setIsEditing(true);
    }
  };

  const handleCompanySelectChange = (event) => {
    const companyIdx = event.target.value;
    const company = companies.find((c) => c.companyIdx === companyIdx);
    handleCompanyClick(company);
  };

  const handleSave = async () => {
    if (!selectedCompany) {
      setSnackbarSeverity("warning");
      setSnackbarMessage("먼저 회사를 선택해주세요.");
      setSnackbarOpen(true);
      return;
    }
    if (!review.trim()) {
      setSnackbarSeverity("warning");
      setSnackbarMessage("리뷰 내용을 입력해주세요.");
      setSnackbarOpen(true);
      return;
    }
    if (!user || !user.id) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요."
      );
      setSnackbarOpen(true);
      return;
    }

    const token = user?.accessToken; // Get token from auth store
    if (!token) {
      setSnackbarSeverity("error");
      setSnackbarMessage("인증 토큰을 찾을 수 없습니다. 다시 로그인해주세요.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch(
        `/api/reviews/${selectedCompany.companyIdx}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            review,
            reviewerType,
            reviewIdx,
            pUserIdx: user.id,
          }),
        }
      );

      if (response.ok) {
        setSnackbarSeverity("success");
        setSnackbarMessage("리뷰가 저장되었습니다.");
        setSnackbarOpen(true);
        setIsEditing(false); // Disable editing after saving
        // Optionally, refetch companies to update the list if a company can only be reviewed once
        // fetchCompanies();
      } else {
        setSnackbarSeverity("error");
        setSnackbarMessage("리뷰 저장에 실패했습니다.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Failed to save review:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("리뷰 저장 중 오류가 발생했습니다.");
      setSnackbarOpen(true);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (companies.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" component="h2" gutterBottom>
          작성 가능한 기업이 없습니다.
        </Typography>
        <Typography variant="body1">지원 현황을 확인해주세요.</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        기업 리뷰 작성
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        리뷰를 작성할 회사를 선택해주세요.
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="company-select-label">회사를 선택하세요</InputLabel>
        <Select
          labelId="company-select-label"
          value={selectedCompany ? selectedCompany.companyIdx : ""}
          label="회사를 선택하세요"
          onChange={handleCompanySelectChange}
        >
          {companies.map((company) => (
            <MenuItem key={company.companyIdx} value={company.companyIdx}>
              {company.companyName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
        {selectedCompany ? (
          <>
            <Typography variant="h5" gutterBottom>
              {selectedCompany.companyName} 리뷰 작성
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">재직 상태</FormLabel>
              <RadioGroup
                row
                name="reviewerType"
                value={reviewerType}
                onChange={(e) => setReviewerType(e.target.value)}
              >
                <FormControlLabel
                  value="CURRENT"
                  control={<Radio />}
                  label="현직원"
                  disabled={!isEditing}
                />
                <FormControlLabel
                  value="FORMER"
                  control={<Radio />}
                  label="전직원"
                  disabled={!isEditing}
                />
              </RadioGroup>
            </FormControl>
            <TextField
              label="리뷰 내용"
              multiline
              rows={8}
              fullWidth
              value={review}
              onChange={(e) => setReview(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              placeholder="리뷰 내용을 작성해주세요."
              disabled={!isEditing}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setReview("");
                      setReviewerType("CURRENT");
                      setReviewIdx(null);
                      setIsEditing(true);
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RateReviewIcon />}
                    onClick={handleSave}
                  >
                    저장
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                >
                  수정
                </Button>
              )}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: "200px",
              color: "text.secondary",
            }}
          >
            <RateReviewIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6">리뷰할 기업을 선택해주세요.</Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
