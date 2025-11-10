import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// dayjs 한국어 로케일 설정
dayjs.locale('ko');

// 개인회원 스타일과 동일한 TextField
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

// 개인회원 스타일과 동일한 Button
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  height: '48px',
  padding: '0 24px',
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

/**
 * 채용공고 작성/수정 폼 컴포넌트
 *
 * Props:
 * - initialData: 초기 데이터 (수정 모드일 때)
 * - onSubmit: 제출 핸들러 (formData를 인자로 받음)
 * - isLoading: 로딩 상태
 * - submitButtonText: 제출 버튼 텍스트 (기본값: "등록하기")
 * - mode: 'create' | 'edit' (생성/수정 모드)
 */
export default function JobPostingForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitButtonText = '등록하기',
  mode = 'create'
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    employmentType: initialData.employmentType || '',
    experienceLevel: initialData.experienceLevel || '',
    salaryInfo: initialData.salaryInfo || '',
    location: initialData.location || '',
    jobType: initialData.jobType || '',
    hireCount: initialData.hireCount || 1,
    startDate: initialData.startDate ? dayjs(initialData.startDate) : null,
    endDate: initialData.endDate ? dayjs(initialData.endDate) : null,
    description: initialData.description || '',
    requiredQualifications: initialData.requiredQualifications || '',
    preferredQualifications: initialData.preferredQualifications || '',
    welfare: initialData.welfare || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // dayjs 객체를 문자열로 변환 (YYYY-MM-DD)
    const submitData = {
      ...formData,
      startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : null,
      endDate: formData.endDate ? formData.endDate.format('YYYY-MM-DD') : null,
    };
    onSubmit(submitData);
  };

  // 고용 형태 옵션
  const employmentTypes = [
    { value: '정규직', label: '정규직' },
    { value: '계약직', label: '계약직' },
    { value: '인턴', label: '인턴' },
    { value: '파견직', label: '파견직' },
    { value: '프리랜서', label: '프리랜서' },
  ];

  // 경력 수준 옵션
  const experienceLevels = [
    { value: '신입', label: '신입' },
    { value: '경력 1~3년', label: '경력 1~3년' },
    { value: '경력 3~5년', label: '경력 3~5년' },
    { value: '경력 5~10년', label: '경력 5~10년' },
    { value: '경력 10년 이상', label: '경력 10년 이상' },
    { value: '경력무관', label: '경력무관' },
  ];

  // 직무 유형 옵션
  const jobTypes = [
    { value: '개발', label: '개발' },
    { value: '기획·PM', label: '기획·PM' },
    { value: '디자인', label: '디자인' },
    { value: '마케팅', label: '마케팅' },
    { value: '영업', label: '영업' },
    { value: '경영지원', label: '경영지원' },
    { value: '고객지원', label: '고객지원' },
    { value: '기타', label: '기타' },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* 기본 정보 섹션 */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            기본 정보
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 공고 제목 */}
            <StyledTextField
              fullWidth
              required
              id="title"
              name="title"
              label="공고 제목"
              value={formData.title}
              onChange={handleChange}
              placeholder="예) 시니어 백엔드 개발자 (Java/Spring)"
            />

            {/* 직무 유형 */}
            <StyledTextField
              fullWidth
              select
              required
              id="jobType"
              name="jobType"
              label="직무 유형"
              value={formData.jobType}
              onChange={handleChange}
            >
              {jobTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </StyledTextField>

            {/* 고용 형태 */}
            <StyledTextField
              fullWidth
              select
              required
              id="employmentType"
              name="employmentType"
              label="고용 형태"
              value={formData.employmentType}
              onChange={handleChange}
            >
              {employmentTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </StyledTextField>

            {/* 경력 수준 */}
            <StyledTextField
              fullWidth
              select
              required
              id="experienceLevel"
              name="experienceLevel"
              label="경력 수준"
              value={formData.experienceLevel}
              onChange={handleChange}
            >
              {experienceLevels.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </StyledTextField>

            {/* 채용 인원 */}
            <StyledTextField
              fullWidth
              type="number"
              id="hireCount"
              name="hireCount"
              label="채용 인원"
              value={formData.hireCount}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
          </Box>
        </Box>

        {/* 근무 조건 섹션 */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            근무 조건
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 근무 지역 */}
            <StyledTextField
              fullWidth
              required
              id="location"
              name="location"
              label="근무 지역"
              value={formData.location}
              onChange={handleChange}
              placeholder="예) 서울 강남구"
            />

            {/* 급여 정보 */}
            <StyledTextField
              fullWidth
              id="salaryInfo"
              name="salaryInfo"
              label="급여 정보"
              value={formData.salaryInfo}
              onChange={handleChange}
              placeholder="예) 연봉 4,000~6,000만원"
            />

            {/* 모집 시작일 */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
              <DatePicker
                label="모집 시작일"
                value={formData.startDate}
                onChange={(newValue) => setFormData(prev => ({ ...prev, startDate: newValue }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        },
                      },
                    }
                  }
                }}
              />
            </LocalizationProvider>

            {/* 모집 마감일 */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
              <DatePicker
                label="모집 마감일"
                value={formData.endDate}
                onChange={(newValue) => setFormData(prev => ({ ...prev, endDate: newValue }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "비워두면 상시채용으로 표시됩니다",
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        },
                      },
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* 상세 정보 섹션 */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            상세 정보
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 공고 설명 */}
            <StyledTextField
              fullWidth
              required
              multiline
              rows={6}
              id="description"
              name="description"
              label="공고 설명"
              value={formData.description}
              onChange={handleChange}
              placeholder="회사 소개 및 업무 내용을 자세히 작성해주세요"
            />

            {/* 필수 자격요건 */}
            <StyledTextField
              fullWidth
              required
              multiline
              rows={5}
              id="requiredQualifications"
              name="requiredQualifications"
              label="필수 자격요건"
              value={formData.requiredQualifications}
              onChange={handleChange}
              placeholder="- Java, Spring Framework 경험&#10;- RESTful API 설계 및 개발 경험&#10;- 3년 이상의 백엔드 개발 경력"
            />

            {/* 우대 자격요건 */}
            <StyledTextField
              fullWidth
              multiline
              rows={5}
              id="preferredQualifications"
              name="preferredQualifications"
              label="우대 자격요건"
              value={formData.preferredQualifications}
              onChange={handleChange}
              placeholder="- MSA 아키텍처 경험&#10;- AWS 클라우드 경험&#10;- Docker/Kubernetes 사용 경험"
            />

            {/* 복리후생 */}
            <StyledTextField
              fullWidth
              multiline
              rows={5}
              id="welfare"
              name="welfare"
              label="복리후생"
              value={formData.welfare}
              onChange={handleChange}
              placeholder="- 4대 보험&#10;- 연차 자유 사용&#10;- 점심 식대 지원&#10;- 재택근무 가능"
            />
          </Box>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <StyledButton
            variant="outlined"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            취소
          </StyledButton>
          <StyledButton
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? '처리 중...' : submitButtonText}
          </StyledButton>
        </Box>
      </Box>
    </Box>
  );
}
