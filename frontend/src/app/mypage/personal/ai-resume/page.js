// 'use client'가 꼭 필요해. useState, onChange 같은 사용자 인터랙션이 있기 때문이야.
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
// import { useAuthStore } from '@/store/authStore'; // Zustand 스토어 (로그인 정보 가져오기용)
// import { api } from '@/api'; // API 래퍼 (데이터 로드/전송용)

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
  // const { user } = useAuthStore((state) => state); // Zustand에서 사용자 정보 가져오기

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
    const fetchUserData = async () => {
      // TODO: 백엔드 API 엔드포인트에서 사용자 정보 가져오기
      // (UserController.java의 /api/user/profile 같은 거)
      // const response = await api.get('/user/profile');
      
      // --- 아래는 가짜 데이터 (DB 연동 시 삭제) ---
      const fakeUserData = {
        name: "홍길동", // personal_user.name
        gender: "male", // personal_user.gender
        birthdate: "1995-01-01", // 이건 DB에 없으니 직접 입력
        phone: "010-1234-5678", // personal_user.phone_number
        email: "hong@example.com", // personal_user.email
        address: "서울시 강남구", // personal_user.address
      };
      // --- 가짜 데이터 끝 ---

      setFormData((prev) => ({
        ...prev,
        ...fakeUserData, // DB에서 불러온 데이터로 폼 채우기
      }));
    };

    fetchUserData();
  }, []); // 빈 배열: 페이지가 처음 마운트될 때 1번만 실행

  // 폼 입력값을 처리하는 공통 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // "AI로 작성하기" 버튼 클릭 시
  const handleAiGenerate = async () => {
    // TODO: 백엔드(AiResumeController.java)에 프롬프트 전송
    console.log("AI에게 전송할 데이터:", formData.aiPrompt);
    // const response = await api.post('/ai/generate-resume', {
    //   prompt: formData.aiPrompt,
    //   userInfo: { ...formData } // 필요시 다른 정보도 같이 전송
    // });
    
    // --- 아래는 가짜 AI 응답 (API 연동 시 삭제) ---
    const fakeAiResponse = {
      selfGrowth: "AI가 작성한 성장과정입니다. 저는 긍정적인 태도와...",
      selfStrengths: "AI가 작성한 장/단점입니다. 저의 장점은 뛰어난...",
      selfMotivation: "AI가 작성한 지원동기입니다. 귀사의 비전에...",
      selfAspirations: "AI가 작성한 입사 후 포부입니다. 입사 후 저는...",
    };
    // --- 가짜 응답 끝 ---

    // AI 응답으로 자기소개서 칸 채우기
    setFormData((prev) => ({
      ...prev,
      ...fakeAiResponse,
    }));
  };

  return (
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
              width: '160px', // 가로 크기 조정
              // height: '200px', // 세로 크기 제거하여 flex-stretch가 적용되도록 함
              border: '2px dashed',
              borderColor: 'grey.400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Typography variant="caption" color="text.secondary">
                사진
              </Typography>
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
                      <FormControlLabel value="필" control={<Radio />} label="병역필" />
                      <FormControlLabel value="미필" control={<Radio />} label="미필" />
                      <FormControlLabel value="해당없음" control={<Radio />} label="해당없음" />
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
                  <StyledInputCell colSpan={3}><FormTextField name="military_reason" value={formData.military_reason} onChange={handleChange} /></StyledInputCell>
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
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* --- 7. AI 프롬프트 섹션 --- */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            ✨ AI로 자기소개서 채우기
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            위의 이력서 내용을 바탕으로 AI가 자기소개서를 작성해 줍니다. AI에게 특별히 강조하고 싶은 점이나 원하는 스타일을 자유롭게 요청해 보세요.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="AI에게 요청할 프롬프트를 입력하세요."
            name="aiPrompt"
            value={formData.aiPrompt}
            onChange={handleChange}
            variant="outlined"
            placeholder="예: 긍정적이고 도전적인 성향을 강조해서 성장과정을 작성해 줘. React와 Next.js 경험을 장점으로 부각시켜 줘."
          />
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleAiGenerate}
              sx={{ minWidth: '200px' }}
            >
              AI로 작성하기
            </Button>
          </Box>

        </Box>
      </Paper>
    </Container>
  );
}