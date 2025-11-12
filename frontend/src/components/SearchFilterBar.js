"use client";
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo, faClose } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

/**
 * ==============================
 * 필터 옵션 상수
 * ==============================
 * 하드코딩된 필터 옵션 배열
 * 필요시 API로 가져오도록 수정 가능
 */
const JOB_TYPES = ["경영/기획", "개발", "디자인", "마케팅", "영업", "기타"];
const LOCATIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "세종",
  "강원",
  "경남",
  "경북",
  "전남",
  "전북",
  "충남",
  "충북",
];
const EMPLOYMENT_TYPES = ["정규직", "정규직전환형", "기간제", "인턴", "기타"];
const EXPERIENCE_LEVELS = ["학력무관", "고졸", "초대졸", "대졸", "석사 이상"];
const COMPANY_TYPES = ["대기업", "중견기업", "중소기업", "공기업", "기타"];
const SOURCE_TYPES = ["내부 지원 가능 공고", "외부 공고"];
const OVERSEAS_TYPES = ["국내 공고", "해외 공고"];

/**
 * ==============================
 * SearchFilterBar 컴포넌트
 * ==============================
 * - 검색창 + 필터 버튼 + 필터 팝업을 제공
 * - props.onSearchAndFilter(searchTerm, filters, responseData?)로 결과 반환
 */
export default function SearchFilterBar({ onSearchAndFilter }) {
  /** ==============================
   * 상태 관리
   * ============================== */
  const [searchTerm, setSearchTerm] = useState(""); // 검색창 입력값
  const [filters, setFilters] = useState({
    // 선택된 필터 상태
    jobType: [],
    location: [],
    employmentType: [],
    experienceLevel: [],
    companyType: [],
    source: [],
    overseas: [],
  });
  const [anchorEl, setAnchorEl] = useState(null); // Popover 기준 엘리먼트
  const [currentFilterType, setCurrentFilterType] = useState(null); // 현재 팝업 필터 카테고리
  const PAGE_SIZE = 18;
  /** ==============================
   * 필터 옵션 반환
   * ============================== */
  function getFilterOptions(filterType) {
    switch (filterType) {
      case "jobType":
        return JOB_TYPES;
      case "location":
        return LOCATIONS;
      case "employmentType":
        return EMPLOYMENT_TYPES;
      case "experienceLevel":
        return EXPERIENCE_LEVELS;
      case "companyType":
        return COMPANY_TYPES;
      case "source":
        return SOURCE_TYPES;
      case "overseas":
        return OVERSEAS_TYPES;
      default:
        return [];
    }
  }

  /** ==============================
   * 필터 토글 함수
   * ==============================
   * - 이미 선택되어 있으면 제거, 아니면 추가
   * - prev 상태 안전하게 복사 후 업데이트
   */
  function handleFilterChange(category, value) {
    setFilters(function (prev) {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(function (v) {
            return v !== value;
          }) // 제거
        : current.concat(value); // 추가
      return Object.assign({}, prev, { [category]: updated });
    });
  }

  /** ==============================
   * 검색 버튼 / 돋보기 클릭
   * ==============================
   * - POST 방식으로 searchTerm + filters를 서버에 전송
   * - 성공 시 onSearchAndFilter 콜백에 결과 전달
   */
  function handleSearch() {
    axios
      .post(`/api/search?page=0&size=${PAGE_SIZE}`, {
        searchTerm: searchTerm,
        filters: filters,
      })
      .then(function (response) {
        console.log("✅ /api/search 응답:", response.data);
        console.dir(response.data, { depth: null });
        onSearchAndFilter(searchTerm, filters, response.data);
      })
      .catch(function (error) {
        console.error("검색 중 오류 발생:", error);
      });

    handleClosePopover(); // 검색 시 팝업 닫기
  }

  /** ==============================
   * 필터 적용 버튼
   * ==============================
   * - 팝업에서 '적용' 클릭 시 POST 요청
   * - '/api/filter'로 보내도록 예시 (서버 구조에 따라 '/api/search' 하나로 통합 가능)
   */
  function handleApplyFilters() {
    axios
      .post(`/api/search?page=0&size=${PAGE_SIZE}`, {
        searchTerm: searchTerm,
        filters: filters,
      })
      .then(function (response) {
        onSearchAndFilter(searchTerm, filters, response.data);
      })
      .catch(function (error) {
        console.error("필터 적용 중 오류:", error);
      });

    handleClosePopover();
  }

  /** ==============================
   * 전체 초기화
   * ==============================
   * - 검색어 + 필터 모두 초기화
   * - 초기 상태 POST 요청
   */
  function handleResetAll() {
    const empty = {
      jobType: [],
      location: [],
      employmentType: [],
      experienceLevel: [],
      companyType: [],
      source: [],
      overseas: [],
    };
    setSearchTerm("");
    setFilters(empty);

    axios
      .post("/api/search", {
        searchTerm: "",
        filters: empty,
      })
      .then(function (response) {
        onSearchAndFilter("", empty, response.data);
      })
      .catch(function (error) {
        console.error("초기화 중 오류:", error);
      });

    handleClosePopover();
  }

  /** ==============================
   * Popover 열기/닫기
   * ============================== */
  function handleOpenPopover(event, filterType) {
    setAnchorEl(event.currentTarget); // 기준 버튼
    setCurrentFilterType(filterType); // 현재 카테고리
  }

  function handleClosePopover() {
    setAnchorEl(null);
    setCurrentFilterType(null);
  }

  /** ==============================
   * 팝업 내 특정 카테고리 초기화
   * ============================== */
  function handleResetFilters(filterType) {
    setFilters(function (prev) {
      const updated = Object.assign({}, prev);
      updated[filterType] = [];
      return updated;
    });
  }

  /** ==============================
   * 선택 개수 반환
   * ============================== */
  function getFilterCount(type) {
    return filters[type].length;
  }

  /** ==============================
   * 검색창 입력 이벤트
   * ============================== */
  function handleInputChange(event) {
    setSearchTerm(event.target.value);
  }

  function handleKeyPress(event) {
    if (event.key === "Enter") handleSearch();
  }

  /** ==============================
   * 렌더링
   * ============================== */
  return (
    <Box sx={{ mb: 4 }}>
      {/* 검색창 영역 */}
      <Box sx={{ maxWidth: "700px", mx: "auto", mb: 8, mt: 4 }}>
        {" "}
        {/* Increased bottom margin */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="기업, 공고, 콘텐츠 검색"
          value={searchTerm}
          onChange={handleInputChange} // 입력 이벤트
          onKeyPress={handleKeyPress} // 엔터 이벤트
          InputProps={{
            sx: { borderRadius: "50px", p: "8px 16px", fontSize: "1.1rem" },
            endAdornment: (
              <IconButton onClick={handleSearch}>
                {" "}
                {/* 돋보기 클릭 */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 19C15.4 19 19 15.4 19 11C19 6.6 15.4 3 11 3C6.6 3 3 6.6 3 11C3 15.4 6.6 19 11 19Z"
                    stroke="#333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="#333"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* 필터 버튼 영역 */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
        }}
      >
        {[
          ["jobType", "직종"],
          ["location", "근무 지역"],
          ["employmentType", "고용 형태"],
          ["experienceLevel", "학력"],
          ["companyType", "기업 종류"],
          ["source", "내부 지원 가능 공고"],
          ["overseas", "국가"],
        ].map(function (item) {
          const key = item[0];
          const label = item[1];
          return (
            <Button
              key={key}
              variant={getFilterCount(key) > 0 ? "contained" : "outlined"}
              onClick={function (e) {
                handleOpenPopover(e, key);
              }}
              sx={{ borderRadius: "8px" }}
            >
              {label}{" "}
              {getFilterCount(key) > 0 ? "(" + getFilterCount(key) + ")" : ""}
            </Button>
          );
        })}

        <Box sx={{ flexGrow: 1 }} />

        {/* 전체 초기화 버튼 */}
        <Button
          startIcon={<FontAwesomeIcon icon={faRedo} size="sm" />}
          onClick={handleResetAll}
          sx={{ color: "text.secondary" }}
        >
          초기화
        </Button>
      </Box>

      {/* Popover: 필터 체크박스 */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: "500px",
            maxHeight: "400px",
            borderRadius: "12px",
            p: 2,
            mt: 1,
          },
        }}
      >
        {/* 팝업 헤더 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {currentFilterType === "jobType" && "직종"}
            {currentFilterType === "location" && "근무 지역"}
            {currentFilterType === "employmentType" && "고용 형태"}
            {currentFilterType === "experienceLevel" && "학력"}
            {currentFilterType === "companyType" && "기업 종류"}
            {currentFilterType === "source" && "내부 지원 가능 공고"}
            {currentFilterType === "overseas" && "국가"}
          </Typography>
          <IconButton onClick={handleClosePopover} size="small">
            <FontAwesomeIcon icon={faClose} />
          </IconButton>
        </Box>

        {/* 체크박스 목록 */}
        <FormGroup
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0.5,
          }}
        >
          {currentFilterType &&
            getFilterOptions(currentFilterType).map(function (option) {
              return (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={filters[currentFilterType].includes(option)}
                      onChange={function () {
                        handleFilterChange(currentFilterType, option);
                      }}
                      size="small"
                    />
                  }
                  label={option}
                  sx={{ m: 0 }}
                />
              );
            })}
        </FormGroup>

        <Divider sx={{ my: 2 }} />

        {/* 팝업 하단 버튼 */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={function () {
              handleResetFilters(currentFilterType);
            }}
          >
            초기화
          </Button>
          <Button variant="contained" onClick={handleApplyFilters}>
            적용
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
