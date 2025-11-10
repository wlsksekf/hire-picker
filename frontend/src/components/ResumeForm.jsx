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

const ResumeFormReadOnlyContext = React.createContext(false);

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
const UndisabledUnderlineTextField = ({ InputProps, sx, ...props }) => (
  <TextField
    variant="standard"
    fullWidth
    InputProps={{ disableUnderline: true, ...(InputProps || {}) }}
    {...props}
    sx={{
      padding: "4px",
      "& .MuiInputBase-input": { textAlign: "center" },
      ...(sx || {}),
    }}
  />
);

// 공통 텍스트 입력 래퍼(폼 전용) - 위 표준 입력을 재사용
// 누락된 컴포넌트로 인한 런타임 오류를 방지하기 위한 최소 정의
const FormTextField = ({ InputProps, disabled, ...props }) => {
  const readOnly = React.useContext(ResumeFormReadOnlyContext);
  const mergedInputProps = { ...(InputProps || {}) };
  if (readOnly) {
    mergedInputProps.readOnly = true;
  }
  return (
    <UndisabledUnderlineTextField
      {...props}
      value={props.value ?? ''}
      InputProps={mergedInputProps}
      disabled={readOnly ? true : disabled}
    />
  );
};

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
  // 경력/자격증 선택 관련 props 추가
  availableExperiences = [],
  availableCertifications = [],
  onExperienceSelect,
  onCertificationSelect,
  readOnly = false,
}) {
  return (
    <ResumeFormReadOnlyContext.Provider value={readOnly}>
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
              inputProps={{ style: { textAlign: "center" } }}
              sx={{
                mb: 4,
                mt: 2,
                "& .MuiInputBase-input": { textAlign: "center" },
              }} // 상단 마진 추가
              InputProps={readOnly ? { readOnly: true } : undefined}
              disabled={readOnly}
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
                  cursor: readOnly ? "default" : "pointer",
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
                    {readOnly ? "프로필 이미지가 없습니다" : "이미지를 클릭해 업로드하세요"}
                  </Typography>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  id="profile-image-upload"
                  disabled={readOnly}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: readOnly ? "default" : "pointer",
                    pointerEvents: readOnly ? "none" : "auto",
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
                        <RadioGroup
                          row
                          name="gender"
                          value={formData.gender}
                          onChange={readOnly ? undefined : onChange}
                        >
                          <FormControlLabel
                            value="male"
                            control={<Radio size="small" disabled={readOnly} />}
                            label="남"
                          />
                          <FormControlLabel
                            value="female"
                            control={<Radio size="small" disabled={readOnly} />}
                            label="여"
                          />
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
                    <StyledLabelCell>학교명</StyledLabelCell>
                    <StyledLabelCell>전공</StyledLabelCell>
                    <StyledLabelCell>상태</StyledLabelCell>
                    <StyledLabelCell>학점</StyledLabelCell>
                    <StyledLabelCell>기간</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledInputCell>
                      <FormTextField name="edu1_school" value={formData.edu1_school} onChange={onChange} placeholder="학교명" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu1_major" value={formData.edu1_major} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu1_status" value={formData.edu1_status} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu1_score" value={formData.edu1_score} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField
                        name="edu1_period"
                        value={formData.edu1_period ?? ''}
                        onChange={onChange}
                        placeholder="YYYY.MM.DD ~ YYYY.MM.DD"
                      />
                    </StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell>
                      <FormTextField name="edu2_school" value={formData.edu2_school} onChange={onChange} placeholder="학교명" />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu2_major" value={formData.edu2_major} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu2_status" value={formData.edu2_status} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField name="edu2_score" value={formData.edu2_score} onChange={onChange} />
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField
                        name="edu2_period"
                        value={formData.edu2_period ?? ''}
                        onChange={onChange}
                        placeholder="YYYY.MM.DD ~ YYYY.MM.DD"
                      />
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
                    <StyledLabelCell>기간</StyledLabelCell>
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
                      <FormTextField
                        name="military_period"
                        value={formData.military_period ?? ''}
                        onChange={onChange}
                        placeholder="YYYY.MM.DD ~ YYYY.MM.DD"
                      />
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
                    <StyledLabelCell sx={{ width: "60%" }}>자격명</StyledLabelCell>
                    <StyledLabelCell sx={{ width: "40%" }}>점수/등급</StyledLabelCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledInputCell>
                      {availableCertifications.length > 0 && onCertificationSelect ? (
                        <Autocomplete
                          fullWidth
                          freeSolo
                  disabled={readOnly}
                          options={availableCertifications}
                          getOptionLabel={(option) => (typeof option === 'string' ? option : option.certName || '')}
                          value={availableCertifications.find(c => c.certName === formData.cert1_name) || formData.cert1_name || null}
                          onChange={(event, newValue) => {
                            if (onCertificationSelect) {
                              onCertificationSelect(1, typeof newValue === 'string' ? null : newValue);
                            }
                          }}
                          onInputChange={(event, newInputValue) => {
                            onChange({ target: { name: 'cert1_name', value: newInputValue } });
                          }}
                          renderInput={(params) => (
                            <UndisabledUnderlineTextField
                              {...params}
                              placeholder="저장된 자격증 선택 또는 직접 입력"
                            />
                          )}
                        />
                      ) : (
                        <FormTextField name="cert1_name" value={formData.cert1_name} onChange={onChange} placeholder="자격명" />
                      )}
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField
                        name="cert1_score"
                        value={formData.cert1_score}
                        onChange={onChange}
                        placeholder="예: 850점 / 1급 / 합격"
                      />
                    </StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell>
                      {availableCertifications.length > 0 && onCertificationSelect ? (
                        <Autocomplete
                          fullWidth
                          freeSolo
                  disabled={readOnly}
                          options={availableCertifications}
                          getOptionLabel={(option) => (typeof option === 'string' ? option : option.certName || '')}
                          value={availableCertifications.find(c => c.certName === formData.cert2_name) || formData.cert2_name || null}
                          onChange={(event, newValue) => {
                            if (onCertificationSelect) {
                              onCertificationSelect(2, typeof newValue === 'string' ? null : newValue);
                            }
                          }}
                          onInputChange={(event, newInputValue) => {
                            onChange({ target: { name: 'cert2_name', value: newInputValue } });
                          }}
                          renderInput={(params) => (
                            <UndisabledUnderlineTextField
                              {...params}
                              placeholder="저장된 자격증 선택 또는 직접 입력"
                            />
                          )}
                        />
                      ) : (
                        <FormTextField name="cert2_name" value={formData.cert2_name} onChange={onChange} placeholder="자격명" />
                      )}
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField
                        name="cert2_score"
                        value={formData.cert2_score}
                        onChange={onChange}
                        placeholder="예: 850점 / 1급 / 합격"
                      />
                    </StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell>
                      {availableCertifications.length > 0 && onCertificationSelect ? (
                        <Autocomplete
                          fullWidth
                          freeSolo
                  disabled={readOnly}
                          options={availableCertifications}
                          getOptionLabel={(option) => (typeof option === 'string' ? option : option.certName || '')}
                          value={availableCertifications.find(c => c.certName === formData.cert3_name) || formData.cert3_name || null}
                          onChange={(event, newValue) => {
                            if (onCertificationSelect) {
                              onCertificationSelect(3, typeof newValue === 'string' ? null : newValue);
                            }
                          }}
                          onInputChange={(event, newInputValue) => {
                            onChange({ target: { name: 'cert3_name', value: newInputValue } });
                          }}
                          renderInput={(params) => (
                            <UndisabledUnderlineTextField
                              {...params}
                              placeholder="저장된 자격증 선택 또는 직접 입력"
                            />
                          )}
                        />
                      ) : (
                        <FormTextField name="cert3_name" value={formData.cert3_name} onChange={onChange} placeholder="자격명" />
                      )}
                    </StyledInputCell>
                    <StyledInputCell>
                      <FormTextField
                        name="cert3_score"
                        value={formData.cert3_score}
                        onChange={onChange}
                        placeholder="예: 850점 / 1급 / 합격"
                      />
                    </StyledInputCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* 5. 경력 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                [경력]
              </Typography>
              {!readOnly && availableExperiences.length > 0 && onExperienceSelect && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Autocomplete
                    size="small"
                    sx={{ width: 200 }}
                    options={availableExperiences}
                    getOptionLabel={(option) => option.companyName || ''}
                    onChange={(event, newValue) => {
                      if (onExperienceSelect && newValue) {
                        // 첫 번째 빈 경력 필드에 자동 채우기
                        if (!formData.exp1_company) {
                          onExperienceSelect(1, newValue);
                        } else if (!formData.exp2_company) {
                          onExperienceSelect(2, newValue);
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="저장된 경력 선택"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  />
                </Box>
              )}
            </Box>
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
                    <StyledInputCell>
                      <FormTextField
                        name="exp1_period"
                        value={formData.exp1_period}
                        onChange={onChange}
                        placeholder="YYYY.MM.DD ~ YYYY.MM.DD (또는 재직중)"
                      />
                    </StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_company" value={formData.exp1_company} onChange={onChange} placeholder="회사명" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_position" value={formData.exp1_position} onChange={onChange} placeholder="직위" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_duties" value={formData.exp1_duties} onChange={onChange} placeholder="담당업무" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp1_type" value={formData.exp1_type} onChange={onChange} placeholder="형태" /></StyledInputCell>
                  </TableRow>
                  <TableRow>
                    <StyledInputCell>
                      <FormTextField
                        name="exp2_period"
                        value={formData.exp2_period}
                        onChange={onChange}
                        placeholder="YYYY.MM.DD ~ YYYY.MM.DD (또는 재직중)"
                      />
                    </StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_company" value={formData.exp2_company} onChange={onChange} placeholder="회사명" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_position" value={formData.exp2_position} onChange={onChange} placeholder="직위" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_duties" value={formData.exp2_duties} onChange={onChange} placeholder="담당업무" /></StyledInputCell>
                    <StyledInputCell><FormTextField name="exp2_type" value={formData.exp2_type} onChange={onChange} placeholder="형태" /></StyledInputCell>
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
              InputProps={readOnly ? { readOnly: true } : undefined}
              disabled={readOnly}
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
              InputProps={readOnly ? { readOnly: true } : undefined}
              disabled={readOnly}
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
              InputProps={readOnly ? { readOnly: true } : undefined}
              disabled={readOnly}
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
              InputProps={readOnly ? { readOnly: true } : undefined}
              disabled={readOnly}
              />
            </Box>

            <Divider sx={{ my: 4 }} />

            {!readOnly && (
              <>
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
              </>
            )}
          </Box>
        </Paper>

        {!readOnly && (
          <>
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
          </>
        )}
      </Container>
    </>
    </ResumeFormReadOnlyContext.Provider>
  );
}

