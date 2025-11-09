"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Alert,
  CircularProgress,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  Box,
} from "@mui/material";
import { StyledFormWrapper } from "@/components/StyledForm";
import styled from "styled-components";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// 복지 혜택 옵션 (예시)
const welfareOptions = [
  "주택자금 대출",
  "자녀 학자금 지원",
  "의료비 지원",
  "피트니스/운동 지원",
  "식사 제공/식대 지원",
  "유연 근무제",
  "재택 근무",
  "성과급",
  "스톡옵션",
  "경조사 지원",
  "명절 선물",
  "생일 선물",
  "단체 보험",
  "건강 검진",
  "사내 동호회",
  "자기계발비 지원",
  "도서 구매비 지원",
  "통신비 지원",
  "교통비 지원",
  "차량 유지비 지원",
  "기숙사/사택 제공",
  "휴양 시설 지원",
  "장기근속 포상",
  "퇴직연금",
];

// 기업 형태 옵션
const companyTypeOptions = ["대기업", "중견기업", "중소기업", "스타트업"];

// 필수 필드 목록 (컴포넌트 밖에 선언하여 불필요한 재생성 방지)
const requiredFields = [
  "name",
  "businessNumber",
  "companyType",
  "ceoNm",
  "adres",
  "employeeCount",
  "logoUrl",
  "sales_amount",
  "welfare_benefits",
];

const CompanyTypeSelection = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const CompanyTypeBox = styled.div`
  flex: 1;
  min-width: 80px;
  padding: 10px 15px;
  border: 1px solid
    ${(props) =>
      props.$isSelected
        ? props.theme.palette.primary.main
        : props.theme.palette.divider};
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  background-color: ${(props) =>
    props.$isSelected
      ? props.theme.palette.primary.main
      : props.theme.palette.background.paper};
  color: ${(props) =>
    props.$isSelected
      ? props.theme.palette.primary.contrastText
      : props.theme.palette.text.primary};
  font-weight: normal;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) =>
      props.$isSelected
        ? props.theme.palette.primary.dark
        : props.theme.palette.action.hover};
  }
`;

export default function CreateCompanyPage() {
  const router = useRouter();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    summary: "",
    homepage: "",
    businessNumber: "",
    logoUrl: "",
    companyType: "",
    ceoNm: "",
    adres: "",
    employeeCount: "",
    sales_amount: "",
    welfare_benefits: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [businessNumberError, setBusinessNumberError] = useState("");

  const [formValid, setFormValid] = useState(false);

  const debouncedName = useDebounce(formData.name, 500);
  const debouncedBusinessNumber = useDebounce(formData.businessNumber, 500);

  // 폼 유효성 검사 함수
  const isFormValid = useCallback(() => {
    const isRequiredFieldsFilled = requiredFields.every((field) => {
      const value = formData[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== "";
    });
    return isRequiredFieldsFilled && !nameError && !businessNumberError;
  }, [formData, nameError, businessNumberError]);

  // 폼 데이터나 에러 상태가 변경될 때마다 버튼 활성화 상태 업데이트
  useEffect(() => {
    setFormValid(isFormValid());
  }, [formData, nameError, businessNumberError, isFormValid]);

  // --- 중복 및 유효성 검사 로직 ---
  useEffect(() => {
    if (debouncedName.trim()) {
      const checkName = async () => {
        try {
          const response = await axios.get("/signup/company/check-duplicate", {
            params: { fieldName: "name", value: debouncedName },
          });
          if (response.data === true) {
            setNameError("이미 등록된 회사명입니다.");
          } else {
            setNameError("");
          }
        } catch (err) {
          console.error("회사명 중복 확인 오류:", err);
        }
      };
      checkName();
    } else {
      setNameError("");
    }
  }, [debouncedName]);

  useEffect(() => {
    if (debouncedBusinessNumber) {
      // 1. 형식 검사
      if (debouncedBusinessNumber.length !== 10) {
        setBusinessNumberError("사업자 등록번호는 10자리 숫자여야 합니다.");
      } else {
        // 2. 형식이 맞으면 중복 검사
        const checkBusinessNumber = async () => {
          try {
            const response = await axios.get(
              "/signup/company/check-duplicate",
              {
                params: {
                  fieldName: "businessNumber",
                  value: debouncedBusinessNumber,
                },
              }
            );
            if (response.data === true) {
              setBusinessNumberError("이미 등록된 사업자등록번호입니다.");
            } else {
              setBusinessNumberError(""); // 형식도 맞고, 중복도 아니면 에러 없음
            }
          } catch (err) {
            console.error("사업자등록번호 중복 확인 오류:", err);
          }
        };
        checkBusinessNumber();
      }
    } else {
      // 필드가 비어있으면 에러 없음
      setBusinessNumberError("");
    }
  }, [debouncedBusinessNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanedValue = value;

    // 숫자 필드는 숫자만 입력되도록 정리
    if (
      name === "businessNumber" ||
      name === "sales_amount" ||
      name === "employeeCount"
    ) {
      cleanedValue = value.replace(/[^0-9]/g, "");
    }

    // 숫자 타입으로 변환해야 할 필드 처리
    if (name === "sales_amount" || name === "employeeCount") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: cleanedValue === "" ? "" : Number(cleanedValue),
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: cleanedValue }));
    }
  };

  const handleWelfareChange = (event, newValue) => {
    setFormData((prevData) => ({ ...prevData, welfare_benefits: newValue }));
  };

  const handleCompanyTypeChange = (type) => {
    setFormData((prevData) => ({ ...prevData, companyType: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setMessage("모든 필수 항목을 올바르게 작성해주세요.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    const dataToSend = {
      ...formData, //formData 안의 모든 key-value를 그대로 복사
      welfare_benefits: formData.welfare_benefits.join(","),
    };

    try {
      const response = await axios.post(
        "/signup/company/create-company",
        dataToSend,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 201) {
        const savedCompany = response.data;
        setMessage(
          `'${savedCompany.name}' 기업 등록이 성공적으로 완료되었습니다!`
        );
        setIsError(false);
        // router.push('/'); // 성공 후 바로 이동하지 않고 메시지를 보여주기 위해 주석 처리
      } else {
        setMessage(`기업 등록 실패: ${response.statusText}`);
        setIsError(true);
      }
    } catch (error) {
      if (error.response) {
        setMessage(
          `기업 등록 실패: ${
            error.response.data.message ||
            error.response.data ||
            error.response.statusText
          }`
        );
      } else if (error.request) {
        setMessage("서버 응답이 없습니다. 네트워크를 확인해주세요.");
      } else {
        setMessage(`요청 중 오류 발생: ${error.message}`);
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledFormWrapper>
      <div className="form-container">
        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 3, textAlign: "center", color: "#333" }}
        >
          신규 기업 등록
        </Typography>

        {message && (
          <Alert
            severity={isError ? "error" : "success"}
            sx={{ width: "100%", mt: 2, mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="name">기업명</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {nameError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 1, display: "block" }}
              >
                {nameError}
              </Typography>
            )}
          </div>
          <div className="input-group">
            <label htmlFor="summary">기업 소개 요약</label>
            <input
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <div className="input-group">
            <label htmlFor="homepage">홈페이지 URL</label>
            <input
              type="url"
              id="homepage"
              name="homepage"
              value={formData.homepage}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="logoUrl">로고 URL</label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="businessNumber">사업자 등록번호</label>
            <input
              type="text"
              id="businessNumber"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
              maxLength={10}
              required
            />
            {businessNumberError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 1, display: "block" }}
              >
                {businessNumberError}
              </Typography>
            )}
          </div>
          {/* ... a lot of form fields ... */}
          <div className="input-group">
            <label>기업 형태</label>
            <CompanyTypeSelection>
              {companyTypeOptions.map((type) => (
                <CompanyTypeBox
                  key={type}
                  $isSelected={formData.companyType === type}
                  onClick={() => handleCompanyTypeChange(type)}
                  theme={theme}
                >
                  {type}
                </CompanyTypeBox>
              ))}
            </CompanyTypeSelection>
          </div>
          <div className="input-group">
            <label htmlFor="ceoNm">대표자명</label>
            <input
              type="text"
              id="ceoNm"
              name="ceoNm"
              value={formData.ceoNm}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="adres">주소</label>
            <input
              type="text"
              id="adres"
              name="adres"
              value={formData.adres}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="employeeCount">직원 수</label>
            <input
              type="text"
              id="employeeCount"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              required
              placeholder="숫자로만 입력해주세요."
            />
          </div>
          <div className="input-group">
            <label htmlFor="sales_amount">연간 매출액(만 원)</label>
            <input
              type="number"
              id="sales_amount"
              name="sales_amount"
              value={formData.sales_amount}
              onChange={handleChange}
              min={0}
              placeholder="(단위: 만 원)"
            />
          </div>
          <div className="input-group">
            <label htmlFor="welfare_benefits">복지 혜택</label>
            <Autocomplete
              multiple
              id="welfare_benefits"
              options={welfareOptions}
              getOptionLabel={(option) => option}
              value={formData.welfare_benefits}
              onChange={handleWelfareChange}
              disableCloseOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={
                    formData.welfare_benefits.length === 0
                      ? "복지 혜택 선택"
                      : ""
                  }
                  InputProps={{ ...params.InputProps, startAdornment: null }}
                  sx={{ mt: 1, mb: 1 }}
                />
              )}
            />
            {formData.welfare_benefits.length > 0 && (
              <Box
                sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: "5px" }}
              >
                {formData.welfare_benefits.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    onDelete={() =>
                      handleWelfareChange(
                        null,
                        formData.welfare_benefits.filter(
                          (item) => item !== option
                        )
                      )
                    }
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      "& .MuiChip-deleteIcon": {
                        color: theme.palette.primary.contrastText,
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || !formValid}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "기업 등록"
            )}
          </Button>
        </form>
      </div>
    </StyledFormWrapper>
  );
}
