'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress, // 로딩 스피너
  // --- Dialog(팝업) 관련 컴포넌트 추가 ---
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useAuthStore from '@/store/authStore'; // Zustand 스토어 (로그인 정보 가져오기용)
import { api } from '@/api'; // API 래퍼 (데이터 로드/전송용)
// --- PDF 관련 컴포넌트 임포트 ---
import dynamic from 'next/dynamic'; // next/dynamic 임포트
import ResumePdfDocument from '@/components/ResumePdfDocument';
import Loader from '@/components/Loader'; // 로더 컴포넌트 추가
import Image from 'next/image'; // Next.js Image 컴포넌트
import { pdf } from '@react-pdf/renderer'; // pdf 함수 임포트

// --- 스타일 컴포넌트 정의 ---

// 테이블의 '헤더' 셀 스타일 (예: "성명", "주소" 등 라벨)
const StyledLabelCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  fontWeight: 'bold',
  border: '1px solid #ccc',
  textAlign: 'center',
  width: '15%', // 라벨 칸 너비 고정
}));

// 테이블의 '입력' 셀 스타일
const StyledInputCell = styled(TableCell)(() => ({
  border: '1px solid #ccc',
  padding: '4px 8px', // 패딩을 살짝 줘서 입력창이 붙지 않게 함
}));

// 테이블 셀 안에서 테두리(underline)가 없는 깔끔한 텍스트 필드
const FormTextField = (props) => (
  <TextField
    variant="standard"
    fullWidth
    InputProps={{ disableUnderline: true, ...props.InputProps }}
    {...props}
    sx={{ padding: '4px' }}
  />
);

// --- AI 이력서 작성 페이지 컴포넌트 ---

export default function AiResumePage() {
  const { isAuthenticated, user } = useAuthStore((state) => state); // Zustand에서 사용자 정보 가져오기
  const [isLoading, setIsLoading] = useState(false); // AI 응답 로딩 상태
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 파일
  const [previewImage, setPreviewImage] = useState(null); // 미리보기 이미지 URL

  // --- 팝업 상태 관리 state 추가 ---
  const [dialogOpen, setDialogOpen] = useState(false); // 메인 선택 팝업
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // 삭제 확인 팝업
  const [isClient, setIsClient] = useState(false); // 클라이언트 렌더링 확인용

  // 페이지가 마운트된 후 isClient를 true로 설정
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 선택된 이미지가 변경될 때마다 미리보기 URL 생성 및 해제
  useEffect(() => {
    // 선택된 파일이 있을 때만 FileReader 실행
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      // selectedImage가 null이면 (예: 업로드 취소) 미리보기 이미지도 null로
      setPreviewImage(null);
    }

    // (참고) 클린업 함수는 data URL을 쓸 땐 필수는 아니지만,
    // Object URL(URL.createObjectURL)을 쓴다면 여기서 URL.revokeObjectURL을 해줘야 해.
  }, [selectedImage]);


  // 이력서 폼의 모든 데이터를 관리하는 state
  const [formData, setFormData] = useState({
    // 인적 사항
    name: '',
    nationality: '',
    gender: 'male', // 기본값
    birthdate: '',
    phone: '',
    email: '',
    address: '',

    // 학력 사항 (원본처럼 2줄 하드코딩)
    edu1_period: '',
    edu1_school: '',
    edu1_major: '',
    edu1_status: '',
    edu1_location: '',
    edu1_score: '',
    edu2_period: '',
    edu2_school: '',
    edu2_major: '',
    edu2_status: '',
    edu2_location: '',
    edu2_score: '',

    // 병역 사항
    military_status: '필',
    military_branch: '',
    military_rank: '',
    military_period: '',
    military_reason: '',

    // 자격 사항 (원본처럼 3줄 하드코딩)
    cert1_name: '',
    cert1_level: '',
    cert1_date: '',
    cert1_issuer: '',
    cert2_name: '',
    cert2_level: '',
    cert2_date: '',
    cert2_issuer: '',
    cert3_name: '',
    cert3_level: '',
    cert3_date: '',
    cert3_issuer: '',

    // 경력 사항
    exp1_period: '',
    exp1_company: '',
    exp1_position: '',
    exp1_duties: '',
    exp1_type: '',
    exp2_period: '',
    exp2_company: '',
    exp2_position: '',
    exp2_duties: '',
    exp2_type: '',

    // 자기소개서
    selfGrowth: '',
    selfStrengths: '',
    selfMotivation: '',
    selfAspirations: '',



    // AI 프롬프트
    aiPrompt: '',
  });

  // 페이지 로드 시 DB에서 사용자 기본 정보 불러오기
  useEffect(() => {
    if (user) { // user 정보가 있을 때만 실행
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        gender: user.gender || 'male',
        phone: user.phoneNumber || '',
        email: user.email || '',
        address: user.address || '',
        // birthdate는 user 객체에 없을 수 있으므로 기존 formData 값을 유지하거나 별도 처리
      }));
    }
  }, [user]); // user 객체가 변경될 때마다 실행

  // 폼 입력값을 처리하는 공통 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    } else {
      setSelectedImage(null);
    }
  };

  // AI에게 보낼 사용자 데이터를 문자열로 변환하는 헬퍼 함수
  const serializeUserData = () => {
    let userDataString = "";
    userDataString += `이름: ${formData.name}, 성별: ${formData.gender}, 생년월일: ${formData.birthdate}, 연락처: ${formData.phone}, 이메일: ${formData.email}, 주소: ${formData.address}\n`;
    userDataString += `학력1: ${formData.edu1_period}, ${formData.edu1_school}, ${formData.edu1_major}, ${formData.edu1_status}, ${formData.edu1_score}\n`;
    userDataString += `학력2: ${formData.edu2_period}, ${formData.edu2_school}, ${formData.edu2_major}, ${formData.edu2_status}, ${formData.edu2_score}\n`;
    userDataString += `병역: ${formData.military_status}, ${formData.military_branch}, ${formData.military_rank}, ${formData.military_period}\n`;
    userDataString += `자격증1: ${formData.cert1_name}, ${formData.cert1_level}, ${formData.cert1_date}\n`;
    userDataString += `자격증2: ${formData.cert2_name}, ${formData.cert2_level}, ${formData.cert2_date}\n`;
    userDataString += `자격증3: ${formData.cert3_name}, ${formData.cert3_level}, ${formData.cert3_date}\n`;
    userDataString += `경력1: ${formData.exp1_period}, ${formData.exp1_company}, ${formData.exp1_position}, ${formData.exp1_duties}\n`;
    userDataString += `경력2: ${formData.exp2_period}, ${formData.exp2_company}, ${formData.exp2_position}, ${formData.exp2_duties}\n`;
    return userDataString;
  }

  // --- AI 호출 로직 (핵심) ---
  const callAiApi = (mode = 'generate') => {
    setIsLoading(true);
    setDialogOpen(false);
    setConfirmDialogOpen(false);

    const userData = serializeUserData();
    const jobPostingData = formData.aiPrompt || "(요청사항 없음)";

    // 백엔드로 보낼 데이터 객체
    const requestBody = {
      userData,
      jobPostingData,
    };

    // "다듬기" 모드일 경우, 기존 자소서 내용을 추가로 전송
    if (mode === 'refine') {
      requestBody.resumeDraft = {
        growthProcess: formData.selfGrowth,
        jobCompetencies: formData.selfMotivation,
        prosAndCons: formData.selfStrengths,
        aspirations: formData.selfAspirations,
      };
    }

    api.post('/api/ai/resume-draft', requestBody)
      .then(response => {
        const { growthProcess, jobCompetencies, prosAndCons, aspirations } = response.data;
        setFormData((prev) => ({
          ...prev,
          selfGrowth: growthProcess,
          selfStrengths: prosAndCons,
          selfMotivation: jobCompetencies,
          selfAspirations: aspirations,
        }));
      })
      .catch(error => {
        console.error("AI 자기소개서 생성 실패:", error);
        alert("AI 자기소개서 생성 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };



  // "AI로 작성하기" 버튼 클릭 핸들러 (로직 수정)
  const handleAiGenerate = () => {
    if (!isAuthenticated) {
      alert("AI 기능을 사용하려면 로그인이 필요합니다.");
      return;
    }

    // 자기소개서에 이미 내용이 있는지 확인
    const hasExistingContent =
      formData.selfGrowth ||
      formData.selfStrengths ||
      formData.selfMotivation ||
      formData.selfAspirations;

    if (hasExistingContent) {
      setDialogOpen(true); // 내용이 있으면 팝업 열기
    } else {
      callAiApi('generate'); // 내용이 없으면 바로 새로 생성
    }
  };

  // --- 팝업(Dialog) 관련 핸들러 ---

  // 메인 팝업 닫기
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // "기존 내용 다듬기" 선택
  const handleRefine = () => {
    callAiApi('refine');
  };

  // "새로 작성하기" 선택 -> 확인 팝업 열기
  const handleStartFresh = () => {
    setDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  // 삭제 확인 팝업 닫기
  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  // 최종적으로 "새로 작성" 확정
  const handleConfirmStartFresh = () => {
    callAiApi('generate');
  };

  // --- 이력서 저장 핸들러 ---
  const handleSaveResume = () => {
    if (!isAuthenticated) {
      alert("이력서를 저장하려면 로그인이 필요합니다.");
      return;
    }

    // selectedImage는 파일 선택 input에서 가져온 File 객체
    if (selectedImage) { // formData.imageUrl이 제거되므로 이 조건은 selectedImage만 확인하게 됨
      console.log("S3에 업로드되지 않은 로컬 이미지가 있습니다. 함께 전송합니다.");
    }

    setIsLoading(true);

    // 1. FormData 객체 생성
    const submissionData = new FormData();

    // 2. 이력서 데이터를 JSON 문자열로 변환
    const resumeDto = {
      ...formData,
      p_user_idx: user?.puserIdx,
    };

    // 3. FormData에 데이터 추가
    // DTO는 'resumeDto'라는 이름의 파트로, Blob 객체로 감싸서 전송
    submissionData.append('resumeDto', new Blob([JSON.stringify(resumeDto)], { type: "application/json" }));

    // 이미지 파일은 'imageFile'이라는 이름의 파트로 추가
    if (selectedImage) {
      submissionData.append('imageFile', selectedImage);
    }

    // 4. api.post 호출 (Content-Type 헤더는 axios가 자동으로 설정하도록 비워둠)
    api.post('/api/resume', submissionData, {
      headers: {
        // 'Content-Type': 'multipart/form-data' // 이 헤더는 axios가 자동으로 생성하므로 명시적으로 설정하지 않음
      },
    })
      .then(response => {
        if (response.status === 201) {
          alert("이력서가 성공적으로 저장되었습니다.");
        }
      })
      .catch(error => {
        console.error("이력서 저장 실패:", error);
        alert("이력서 저장 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // PDF 다운로드 핸들러 (Blob URL 방식)
  const handleDownload = async () => {
    try {
      const blob = await pdf(<ResumePdfDocument formData={formData} imageUrl={previewImage} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '이력서.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF 다운로드 중 오류:', error);
    }
  };


  return (
    <>
      {/* --- 로딩 오버레이 --- */}
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // 배경을 희미하게 처리
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // 다른 요소들 위에 표시
          }}
        >
          <Loader />
        </Box>
      )}

      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, my: 4 }}>
          <Box component="form" noValidate autoComplete="off">

            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              입사지원서
            </Typography>

            {/* --- 1. 기본 인적 사항 --- */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              {/* 사진 영역 */}
              <Box sx={{
                width: '120px',
                height: '160px',
                border: '2px dashed',
                borderColor: 'grey.400',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden', // Image가 Box 밖으로 나가지 않게
              }}>
                {previewImage ? (
                  <Image src={previewImage} alt="미리보기" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    사진을 드래그하거나 클릭해 업로드
                  </Typography>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="profile-image-upload" // id 추가
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 1, // input이 위에 오도록 zIndex 설정
                  }}
                />

              </Box>

              {/* 인적사항 테이블 영역 */}
              <TableContainer sx={{ border: '1px solid #ccc', width: '100%' }}>
                <Table sx={{ tableLayout: 'fixed' }}>
                  <TableBody>
                    <TableRow>
                      <StyledLabelCell>성명</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="name" value={formData.name} onChange={handleChange} />
                      </StyledInputCell>
                      <StyledLabelCell>국적</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="nationality" value={formData.nationality} onChange={handleChange} />
                      </StyledInputCell>
                    </TableRow>
                    <TableRow>
                      <StyledLabelCell>성별</StyledLabelCell>
                      <StyledInputCell>
                        <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                          <FormControlLabel value="male" control={<Radio size="small" />} label="남" />
                          <FormControlLabel value="female" control={<Radio size="small" />} label="여" />
                        </RadioGroup>
                      </StyledInputCell>
                      <StyledLabelCell>생년월일</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="birthdate" value={formData.birthdate} onChange={handleChange} placeholder="YYYY-MM-DD" />
                      </StyledInputCell>
                    </TableRow>
                    <TableRow>
                      <StyledLabelCell>휴대폰</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="phone" value={formData.phone} onChange={handleChange} />
                      </StyledInputCell>
                      <StyledLabelCell>E-mail</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="email" value={formData.email} onChange={handleChange} />
                      </StyledInputCell>
                    </TableRow>
                    <TableRow>
                      <StyledLabelCell>주소</StyledLabelCell>
                      <StyledInputCell colSpan={3}>
                        <FormTextField name="address" value={formData.address} onChange={handleChange} />
                      </StyledInputCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* --- 2. 학력 사항 --- */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              [학력사항]
            </Typography>
            <TableContainer sx={{ border: '1px solid #ccc', mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledLabelCell sx={{ width: '25%' }}>기간</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '15%' }}>학교명</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '20%' }}>학과</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '15%' }}>졸업구분</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '10%' }}>소재지</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '15%' }}>학점</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* 학력 1 */}
                  <TableRow>
                    <StyledInputCell><FormTextField name="edu1_period" value={formData.edu1_period} onChange={handleChange} placeholder="YYYY.MM ~ YYYY.MM" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu1_school" value={formData.edu1_school} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu1_major" value={formData.edu1_major} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu1_status" value={formData.edu1_status} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu1_location" value={formData.edu1_location} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu1_score" value={formData.edu1_score} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                  {/* 학력 2 */}
                  <TableRow>
                    <StyledInputCell><FormTextField name="edu2_period" value={formData.edu2_period} onChange={handleChange} placeholder="YYYY.MM ~ YYYY.MM" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu2_school" value={formData.edu2_school} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu2_major" value={formData.edu2_major} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu2_status" value={formData.edu2_status} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu2_location" value={formData.edu2_location} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="edu2_score" value={formData.edu2_score} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* --- 3. 병역 사항 --- */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              [병역사항]
            </Typography>
            <TableContainer sx={{ border: '1px solid #ccc', mb: 4 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <StyledLabelCell>구분</StyledLabelCell>
                    <StyledInputCell>
                      <RadioGroup row name="military_status" value={formData.military_status} onChange={handleChange}>
                        <FormControlLabel value="필" control={<Radio size="small" />} label="병역필" />
                        <FormControlLabel value="미필" control={<Radio size="small" />} label="미필" />
                        <FormControlLabel value="해당없음" control={<Radio size="small" />} label="해당없음" />
                      </RadioGroup>
                    </StyledInputCell>
                    <StyledLabelCell>군별</StyledLabelCell>
                    <StyledInputCell><FormTextField name="military_branch" value={formData.military_branch} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledLabelCell>계급</StyledLabelCell>
                    <StyledInputCell><FormTextField name="military_rank" value={formData.military_rank} onChange={handleChange} /></StyledInputCell>
                    <StyledLabelCell>복무기간</StyledLabelCell>
                    <StyledInputCell><FormTextField name="military_period" value={formData.military_period} onChange={handleChange} placeholder="YYYY.MM ~ YYYY.MM" /></StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledLabelCell>면제사유</StyledLabelCell>
                    <StyledInputCell colSpan={3}>
                      <FormTextField name="military_reason" value={formData.military_reason} onChange={handleChange} />
                    </StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* --- 4. 자격 및 면허 취득 사항 --- */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              [자격 및 면허 취득 사항]
            </Typography>
            <TableContainer sx={{ border: '1px solid #ccc', mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledLabelCell sx={{ width: '35%' }}>자격증명</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '20%' }}>등급(점수)</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '20%' }}>취득년월</StyledLabelCell>
                    <StyledLabelCell>발급기관</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* 자격증 1 */}
                  <TableRow>
                    <StyledInputCell><FormTextField name="cert1_name" value={formData.cert1_name} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert1_level" value={formData.cert1_level} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert1_date" value={formData.cert1_date} onChange={handleChange} placeholder="YYYY.MM.DD" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert1_issuer" value={formData.cert1_issuer} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                  {/* 자격증 2 */}
                  <TableRow>
                    <StyledInputCell><FormTextField name="cert2_name" value={formData.cert2_name} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert2_level" value={formData.cert2_level} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert2_date" value={formData.cert2_date} onChange={handleChange} placeholder="YYYY.MM.DD" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert2_issuer" value={formData.cert2_issuer} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                  {/* 자격증 3 */}
                  <TableRow>
                    <StyledInputCell><FormTextField name="cert3_name" value={formData.cert3_name} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert3_level" value={formData.cert3_level} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert3_date" value={formData.cert3_date} onChange={handleChange} placeholder="YYYY.MM.DD" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert3_issuer" value={formData.cert3_issuer} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* --- 5. 경력사항 --- */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              [경력사항]
            </Typography>
            <TableContainer sx={{ border: '1px solid #ccc', mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledLabelCell sx={{ width: '25%' }}>근무기간</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '20%' }}>회사명</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '15%' }}>직위</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '30%' }}>담당업무</StyledLabelCell>
                    <StyledLabelCell sx={{ width: '10%' }}>구분</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* 경력 1 */}
                  <TableRow>
                    <StyledInputCell><FormTextField name="exp1_period" value={formData.exp1_period} onChange={handleChange} placeholder="YYYY.MM ~ YYYY.MM" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_company" value={formData.exp1_company} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_position" value={formData.exp1_position} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_duties" value={formData.exp1_duties} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_type" value={formData.exp1_type} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                  {/* 경력 2 */}
                  <TableRow>
                    <StyledInputCell><FormTextField name="exp2_period" value={formData.exp2_period} onChange={handleChange} placeholder="YYYY.MM ~ YYYY.MM" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_company" value={formData.exp2_company} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_position" value={formData.exp2_position} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_duties" value={formData.exp2_duties} onChange={handleChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_type" value={formData.exp2_type} onChange={handleChange} /></StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* --- 6. 자기소개서 --- */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
              [자기소개서]
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="1. 성장과정"
                name="selfGrowth"
                value={formData.selfGrowth}
                onChange={handleChange}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="2. 성격의 장·단점 및 특기"
                name="selfStrengths"
                value={formData.selfStrengths}
                onChange={handleChange}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="3. 지원동기"
                name="selfMotivation"
                value={formData.selfMotivation}
                onChange={handleChange}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="4. 입사 후 포부"
                name="selfAspirations"
                value={formData.selfAspirations}
                onChange={handleChange}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* --- 7. AI 프롬프트 섹션 --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Image src="/picky.png" alt="Picky" width={24} height={24} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                AI로 자기소개서 채우기
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              위의 이력서 내용을 바탕으로 이력서 작성 비서 ai 픽키가 자기소개서를 작성해 줍니다. 픽키에게 특별히 강조하고 싶은 점이나 원하는 스타일을 자유롭게 요청해 보세요.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="픽키에게 요청할 프롬프트를 입력하세요."
              name="aiPrompt"
              value={formData.aiPrompt}
              onChange={handleChange}
              variant="outlined"
              placeholder="예: 긍정적이고 도전적인 성향을 강조해서 성장과정을 작성해 줘. java와 python을 사용한 실무 경험을 장점으로 부각시켜 줘."
            />

            {/* ▼▼▼ [수정 2] 버튼 영역 가독성 수정 + flexWrap: 'wrap' 추가 ▼▼▼ */}
            <Box
              textAlign="center"
              sx={{
                mt: 2,
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap' // 버튼이 많아지면 줄바꿈 처리
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleAiGenerate}
                sx={{ minWidth: '200px' }}
                disabled={isLoading} // 로딩 중일 때 버튼 비활성화
              >
                {isLoading ? <CircularProgress size={24} /> : "AI로 작성하기"}
              </Button>

              {/* ▼▼▼ [수정 3] 하이드레이션 오류 방지를 위해 isClient로 래핑 (PDFDownloadLink) ▼▼▼ */}
              {isClient && (
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ minWidth: '200px' }}
                  onClick={handleDownload} // 새로운 다운로드 핸들러 연결
                  disabled={isLoading} // 로딩 중일 때 비활성화
                >
                  {isLoading ? <CircularProgress size={24} /> : "PDF로 다운로드"}
                </Button>
              )}

              {/* 이력서 저장 버튼 */}
              <Button
                variant="contained"
                size="large"
                sx={{ minWidth: '200px' }}
                onClick={handleSaveResume} // 저장 핸들러 연결
                disabled={isLoading} // 로딩 중일 때 버튼 비활성화
              >
                {isLoading ? <CircularProgress size={24} /> : "이력서 저장"}
              </Button>
            </Box>

          </Box>
        </Paper>

        {/* --- 선택 팝업 (Dialog) --- */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"이미 작성 중인 내용이 있습니다!"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              AI가 어떻게 도와드릴까요?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>취소</Button>
            <Button onClick={handleStartFresh} color="error">
              기존 내용 전부 지우고 새로 작성
            </Button>
            <Button onClick={handleRefine} variant="contained" autoFocus>
              기존 내용 더 다듬기
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- 삭제 확인 팝업 (Confirm Dialog) --- */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleConfirmDialogClose}
        >
          <DialogTitle>정말 새로 작성할까요?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              이 작업은 되돌릴 수 없습니다. 현재 자기소개서에 작성된 모든 내용이 삭제됩니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDialogClose}>취소</Button>
            <Button onClick={handleConfirmStartFresh} color="error">
              삭제하고 새로 작성
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}
