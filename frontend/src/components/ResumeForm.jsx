"use client";

import React, { useState } from "react";
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete, // Autocomplete 임포트
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Loader from "@/components/Loader"; // 로딩 스피너

// 테이블 라벨 셀 스타일
const StyledLabelCell = styled(TableCell)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800],
  fontWeight: "bold",
  border: "1px solid #ccc",
  textAlign: "center",
  width: "15%",
}));

// 테이블 입력 셀 스타일
const StyledInputCell = styled(TableCell)(() => ({
  border: "1px solid #ccc",
  padding: "4px 8px",
}));

// 밑줄 제거한 입력 필드 (Autocomplete 내부에서 사용될 예정)
const UndisabledUnderlineTextField = (props) => (
  <TextField
    variant="standard"
    fullWidth
    InputProps={{ disableUnderline: true, ...props.InputProps }}
    {...props}
    sx={{ padding: "4px" }}
  />
);

// 공통 텍스트 입력 래퍼(폼 전용) - 위 표준 입력을 재사용
// 누락된 컴포넌트로 인한 런타임 오류를 방지하기 위한 최소 정의
const FormTextField = (props) => (
  <UndisabledUnderlineTextField {...props} />
);

// 프리젠테이션 컴포넌트: 이력서 작성 양식
export default function ResumeForm({
  formData,
  onChange,
  previewImage,
  onImageChange,
  isLoading,
  onAiGenerate,
  onOpenAiDialog,
  onDownload,
  onSave,
  dialogOpen,
  onDialogClose,
  onStartFresh,
  onRefine,
  confirmDialogOpen,
  onConfirmDialogClose,
  onConfirmStartFresh,
  // 학교 검색 관련 props 추가
  searchSchools,
  onSchoolSelect,
  schoolOptions1,
  schoolLoading1,
  schoolOptions2,
  schoolLoading2,
}) {
  const [searchOpen1, setSearchOpen1] = useState(false);
  const [searchOpen2, setSearchOpen2] = useState(false);

  // Autocomplete의 value를 처리하기 위한 헬퍼 함수
  const getSchoolValue = (eduPrefix) => {
    const schoolName = formData[`${eduPrefix}_school`];
    const schoolCode = formData[`${eduPrefix}_schoolCode`];
    if (schoolName && schoolCode !== null) {
      return { schoolName: schoolName, schoolCode: schoolCode };
    }
    return null;
  };

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // 오버레이 배경
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Loader />
        </Box>
      )}

      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, my: 4 }}>
          <Box component="form" noValidate autoComplete="off">
            {/* 이력서 제목 입력 필드 */} 
            <TextField
              fullWidth
              label="이력서 제목"
              name="title"
              value={formData.title}
              onChange={onChange}
              variant="outlined"
              margin="normal"
              sx={{ mb: 4, mt: 2 }} // 상단 마진 추가
            />

            {/* 1. 기본 정보 */}
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              {/* 프로필 이미지 */}
              <Box
                sx={{
                  width: "120px",
                  height: "160px",
                  border: "2px dashed",
                  borderColor: "grey.400",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="프로필 사진"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    이미지를 클릭해 업로드하세요
                  </Typography>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  id="profile-image-upload"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 1,
                  }}
                />
              </Box>

              {/* 인적사항 */}
              <TableContainer sx={{ border: "1px solid #ccc", width: "100%" }}>
                <Table sx={{ tableLayout: "fixed" }}>
                  <TableBody>
                    <TableRow>
                      <StyledLabelCell>성명</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="name" value={formData.name} onChange={onChange} />
                      </StyledInputCell>
                      <StyledLabelCell>국적</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="nationality" value={"내국인"} />
                      </StyledInputCell>
                    </TableRow>
                    <TableRow>
                      <StyledLabelCell>성별</StyledLabelCell>
                      <StyledInputCell>
                        <RadioGroup row name="gender" value={formData.gender} onChange={onChange}>
                          <FormControlLabel value="male" control={<Radio size="small" />} label="남" />
                          <FormControlLabel value="female" control={<Radio size="small" />} label="여" />
                        </RadioGroup>
                      </StyledInputCell>
                      <StyledLabelCell>생년월일</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="birthdate" value={formData.birthdate} onChange={onChange} placeholder="YYYY-MM-DD" />
                      </StyledInputCell>
                    </TableRow>
                    <TableRow>
                      <StyledLabelCell>연락처</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="phone" value={formData.phone} onChange={onChange} />
                      </StyledInputCell>
                      <StyledLabelCell>E-mail</StyledLabelCell>
                      <StyledInputCell>
                        <FormTextField name="email" value={formData.email} onChange={onChange} />
                      </StyledInputCell>
                    </TableRow>
                    <TableRow>
                      <StyledLabelCell>주소</StyledLabelCell>
                      <StyledInputCell colSpan={3}>
                        <FormTextField name="address" value={formData.address} onChange={onChange} />
                      </StyledInputCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 2. 학력 사항 */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              [학력 사항]
            </Typography>
            <TableContainer sx={{ border: "1px solid #ccc" }}>
              <Table sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <StyledLabelCell>기간</StyledLabelCell>
                    <StyledLabelCell>학교명</StyledLabelCell>
                    <StyledLabelCell>전공</StyledLabelCell>
                    <StyledLabelCell>상태</StyledLabelCell>
                    <StyledLabelCell>소재지</StyledLabelCell>
                    <StyledLabelCell>학점</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledInputCell>
                      <FormTextField name="edu1_period" value={formData.edu1_period} onChange={onChange} placeholder="YYYY.MM ~ YYYY.MM" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <Autocomplete
                        fullWidth
                        options={schoolOptions1}
                        getOptionLabel={(option) => option.schoolName || ""}
                        isOptionEqualToValue={(option, value) => option.schoolCode === value.schoolCode}
                        value={getSchoolValue("edu1")}
                        onChange={(event, newValue) => {
                          onSchoolSelect("edu1", newValue);
                        }}
                        onInputChange={(event, newInputValue) => {
                          onChange({ target: { name: "edu1_school", value: newInputValue } });
                          searchSchools("edu1", newInputValue);
                        }}
                        loading={schoolLoading1}
                        open={searchOpen1}
                        onOpen={() => setSearchOpen1(true)}
                        onClose={() => setSearchOpen1(false)}
                        renderInput={(params) => (
                          <UndisabledUnderlineTextField
                            {...params}
                            name="edu1_school"
                            placeholder="학교명"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <React.Fragment>
                                  {schoolLoading1 ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </React.Fragment>
                              ),
                            }}
                          />
                        )}
                      />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu1_major" value={formData.edu1_major} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu1_status" value={formData.edu1_status} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu1_location" value={formData.edu1_location} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu1_score" value={formData.edu1_score} onChange={onChange} />
                    </StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell>
                      <FormTextField name="edu2_period" value={formData.edu2_period} onChange={onChange} placeholder="YYYY.MM ~ YYYY.MM" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <Autocomplete
                        fullWidth
                        options={schoolOptions2}
                        getOptionLabel={(option) => option.schoolName || ""}
                        isOptionEqualToValue={(option, value) => option.schoolCode === value.schoolCode}
                        value={getSchoolValue("edu2")}
                        onChange={(event, newValue) => {
                          onSchoolSelect("edu2", newValue);
                        }}
                        onInputChange={(event, newInputValue) => {
                          onChange({ target: { name: "edu2_school", value: newInputValue } });
                          searchSchools("edu2", newInputValue);
                        }}
                        loading={schoolLoading2}
                        open={searchOpen2}
                        onOpen={() => setSearchOpen2(true)}
                        onClose={() => setSearchOpen2(false)}
                        renderInput={(params) => (
                          <UndisabledUnderlineTextField
                            {...params}
                            name="edu2_school"
                            placeholder="학교명"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <React.Fragment>
                                  {schoolLoading2 ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </React.Fragment>
                              ),
                            }}
                          />
                        )}
                      />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu2_major" value={formData.edu2_major} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu2_status" value={formData.edu2_status} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu2_location" value={formData.edu2_location} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu2_score" value={formData.edu2_score} onChange={onChange} />
                    </StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* 3. 병역 */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mt: 4 }}>
              [병역]
            </Typography>
            <TableContainer sx={{ border: "1px solid #ccc" }}>
              <Table sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <StyledLabelCell>상태</StyledLabelCell>
                    <StyledLabelCell>군별</StyledLabelCell>
                    <StyledLabelCell>계급</StyledLabelCell>
                    <StyledLabelCell>복무기간</StyledLabelCell>
                    <StyledLabelCell>면제사유</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledInputCell>
                      <FormTextField name="military_status" value={formData.military_status} onChange={onChange} placeholder="복무 / 면제 / 미필 등" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="military_branch" value={formData.military_branch} onChange={onChange} placeholder="육군/해군/공군/기타" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="military_rank" value={formData.military_rank} onChange={onChange} placeholder="계급" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="military_period" value={formData.military_period} onChange={onChange} placeholder="YYYY.MM ~ YYYY.MM" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="military_reason" value={formData.military_reason} onChange={onChange} placeholder="면제 사유" />
                    </StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* 4. 자격증 */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mt: 4 }}>
              [자격증]
            </Typography>
            <TableContainer sx={{ border: "1px solid #ccc" }}>
              <Table sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <StyledLabelCell sx={{ width: "25%" }}>자격명</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "20%" }}>등급/급수</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "20%" }}>취득일</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "35%" }}>발급기관</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledInputCell><FormTextField name="cert1_name" value={formData.cert1_name} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert1_level" value={formData.cert1_level} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert1_date" value={formData.cert1_date} onChange={onChange} placeholder="YYYY.MM.DD" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert1_issuer" value={formData.cert1_issuer} onChange={onChange} /></StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell><FormTextField name="cert2_name" value={formData.cert2_name} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert2_level" value={formData.cert2_level} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert2_date" value={formData.cert2_date} onChange={onChange} placeholder="YYYY.MM.DD" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert2_issuer" value={formData.cert2_issuer} onChange={onChange} /></StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell><FormTextField name="cert3_name" value={formData.cert3_name} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert3_level" value={formData.cert3_level} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert3_date" value={formData.cert3_date} onChange={onChange} placeholder="YYYY.MM.DD" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="cert3_issuer" value={formData.cert3_issuer} onChange={onChange} /></StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* 5. 경력 */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mt: 4 }}>
              [경력]
            </Typography>
            <TableContainer sx={{ border: "1px solid #ccc" }}>
              <Table sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <StyledLabelCell sx={{ width: "20%" }}>기간</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "15%" }}>회사명</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "20%" }}>직위</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "35%" }}>담당업무</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "10%" }}>형태</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledInputCell><FormTextField name="exp1_period" value={formData.exp1_period} onChange={onChange} placeholder="YYYY.MM ~ YYYY.MM" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_company" value={formData.exp1_company} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_position" value={formData.exp1_position} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_duties" value={formData.exp1_duties} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_type" value={formData.exp1_type} onChange={onChange} /></StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell><FormTextField name="exp2_period" value={formData.exp2_period} onChange={onChange} placeholder="YYYY.MM ~ YYYY.MM" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_company" value={formData.exp2_company} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_position" value={formData.exp2_position} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_duties" value={formData.exp2_duties} onChange={onChange} /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_type" value={formData.exp2_type} onChange={onChange} /></StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* 6. 자기소개서 */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mt: 4 }}>
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
                onChange={onChange}
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="2. 장단점 및 보완점"
                name="selfStrengths"
                value={formData.selfStrengths}
                onChange={onChange}
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="3. 지원동기 및 직무역량"
                name="selfMotivation"
                value={formData.selfMotivation}
                onChange={onChange}
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
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
                onChange={onChange}
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
              />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* 7. AI 보조 */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Image src="/picky.png" alt="Picky" width={32} height={32} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                AI 자기소개서 초안 쓰기/개선하기
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ai 이력서 작성 비서 픽키에게 정보를 입력해 주세요.
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              name="aiPrompt"
              value={formData.aiPrompt}
              onChange={onChange}
              placeholder="예) 회사 소개, 직무 요구사항, 우대사항 등 핵심만 요약하여 입력하세요."
            />

            {/* 버튼 영역 */}
            <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => (typeof onOpenAiDialog === 'function' ? onOpenAiDialog() : onAiGenerate())}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={18} /> : "AI 초안 생성"}
              </Button>
              <Button variant="outlined" onClick={onDownload}>PDF 다운로드</Button>
              <Button variant="contained" onClick={onSave}>저장</Button>
            </Box>
          </Box>
        </Paper>

        {/* 다이얼로그: 선택 안내 */}
        <Dialog
          open={dialogOpen}
          onClose={onDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">내용을 어떻게 할까요?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              기존 작성된 자기소개서가 있습니다. 새로 생성하거나 개선을 선택하세요.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onDialogClose}>취소</Button>
            <Button onClick={onStartFresh} color="error">새로 생성</Button>
            <Button onClick={onRefine} variant="contained" autoFocus>
              개선하기
            </Button>
          </DialogActions>
        </Dialog>

        {/* 다이얼로그: 새로 생성 확인 */}
        <Dialog open={confirmDialogOpen} onClose={onConfirmDialogClose}>
          <DialogTitle>정말 새로 생성할까요?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              기존 내용이 덮어써집니다. 계속하시겠습니까?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onConfirmDialogClose}>취소</Button>
            <Button onClick={onConfirmStartFresh} color="error">새로 생성</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

