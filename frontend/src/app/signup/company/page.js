'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import {
  sendVerificationEmail,
  checkVerificationCode,
  searchCompanies,
  signupCompany,
} from '@/api';
import { StyledFormWrapper } from '@/components/StyledForm';
import { debounce } from '@mui/material/utils';
import Link from 'next/link';

export default function CompanySignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: '', // 로그인 아이디
    password: '',
    passwordConfirm: '',
    name: '', // 담당자 이름
    email: '',
    phone_number: '',
    verificationCode: '',
    companyIdx: null, // 회사 ID
  });

  // 파일 업로드 state
  const [verificationFile, setVerificationFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- 회사 검색 상태 ---
  const [companyInputValue, setCompanyInputValue] = useState('');
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'phone_number') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      setFormData(prevData => ({ ...prevData, [name]: onlyNums }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  // --- 회사 검색 로직 ---
  const fetchCompanies = React.useMemo(
    () =>
      debounce(input => {
        if (input) {
          searchCompanies(input)
            .then(response => {
              setCompanyOptions(response.data || []);
            })
            .catch(_ => setCompanyOptions([]));
        }
      }, 400),
    []
  );

  useEffect(() => {
    fetchCompanies(companyInputValue);
  }, [companyInputValue, fetchCompanies]);

  // --- 파일 업로드 로직 ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (!file) {
      setVerificationFile(null);
      return;
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('파일 크기는 10MB를 초과할 수 없습니다.');
      setVerificationFile(null);
      return;
    }

    // 파일 확장자 검증
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setFileError('PDF, JPG, PNG 파일만 업로드 가능합니다.');
      setVerificationFile(null);
      return;
    }

    setVerificationFile(file);
  };

  // --- 이메일 인증 로직 ---
  const handleSendCode = () => {
    if (!formData.email) {
      setError('담당자 이메일을 입력하세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    sendVerificationEmail(formData.email)
      .then(() => {
        setIsCodeSent(true);
        setSuccessMessage('인증 코드가 발송되었습니다. 이메일을 확인하세요.');
      })
      .catch(err => {
        // 에러 응답이 객체인 경우 문자열로 변환
        const errorMsg = err.response?.data;
        const errorText = typeof errorMsg === 'object'
          ? (errorMsg.message || JSON.stringify(errorMsg))
          : (errorMsg || '인증 코드 발송에 실패했습니다.');
        setError(errorText);
      })
      .finally(() => setLoading(false));
  };

  const handleCheckCode = () => {
    if (!formData.verificationCode) {
      setError('인증 코드를 입력하세요.');
      return;
    }
    setVerifyLoading(true);
    setError(null);
    checkVerificationCode(formData.email, formData.verificationCode)
      .then(response => {
        setIsCodeConfirmed(true);
        setSuccessMessage(response.data);
      })
      .catch(err => {
        // 에러 응답이 객체인 경우 문자열로 변환
        const errorMsg = err.response?.data;
        const errorText = typeof errorMsg === 'object'
          ? (errorMsg.message || JSON.stringify(errorMsg))
          : (errorMsg || '인증 코드 확인에 실패했습니다.');
        setError(errorText);
      })
      .finally(() => setVerifyLoading(false));
  };

  // --- 최종 제출 로직 ---
  const handleSubmit = e => {
    e.preventDefault();
    setError(null);

    // === 검증 단계 ===
    if (!isCodeConfirmed) {
      return setError('이메일 인증을 먼저 완료해주세요.');
    }
    if (!formData.companyIdx) {
      return setError('회사를 선택해주세요.');
    }
    if (!formData.id || !formData.password || !formData.name || !formData.phone_number) {
      return setError('필수 항목을 모두 입력해주세요.');
    }
    if (formData.password !== formData.passwordConfirm) {
      return setError('비밀번호가 일치하지 않습니다.');
    }
    if (!verificationFile) {
      return setError('인증 파일(사업자등록증 등)을 첨부해주세요.');
    }

    setLoading(true);

    // === FormData 생성 (파일 + JSON 데이터) ===
    const formDataToSend = new FormData();

    // JSON 데이터 추가 (passwordConfirm 제외)
    const { passwordConfirm, verificationCode, ...signupData } = formData;
    formDataToSend.append('signupData', new Blob([JSON.stringify(signupData)], {
      type: 'application/json'
    }));

    // 파일 추가
    formDataToSend.append('verificationFile', verificationFile);

    // === API 호출 ===
    signupCompany(formDataToSend)
      .then((response) => {
        const message = response.data?.message || '기업 회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.';
        alert(message);
        router.push('/login');
      })
      .catch(err => {
        // 에러 응답이 객체인 경우 문자열로 변환
        const errorMsg = err.response?.data;
        const errorText = typeof errorMsg === 'object'
          ? (errorMsg.message || JSON.stringify(errorMsg))
          : (errorMsg || '회원가입에 실패했습니다.');
        setError(errorText);
      })
      .finally(() => setLoading(false));
  };

  return (
    <StyledFormWrapper>
      <div className="form-container">
        <p className="title">기업 회원가입</p>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="companyName">회사명</label>
            <Autocomplete
              fullWidth
              getOptionLabel={option => option.companyName || ''}
              filterOptions={x => x}
              options={companyOptions}
              autoComplete
              includeInputInList
              filterSelectedOptions
              value={selectedCompany}
              noOptionsText="검색 결과가 없습니다."
              onChange={(event, newValue) => {
                setCompanyOptions(newValue ? [newValue, ...companyOptions] : companyOptions);
                setSelectedCompany(newValue);
                setFormData(prev => ({
                  ...prev,
                  companyIdx: newValue ? newValue.companyIdx : null,
                }));
              }}
              onInputChange={(event, newInputValue) => {
                setCompanyInputValue(newInputValue);
              }}
              renderInput={params => <TextField {...params} variant="outlined" fullWidth />}
            />
            <Link
              href="/signup/company/create"
              style={{
                display: 'block',
                textAlign: 'right',
                color: 'inherit',
                textDecoration: 'none',
                marginTop: '3px',
                fontSize: '12px',
              }}
            >
              새로운 회사 등록하기
            </Link>
          </div>

          <div className="input-group">
            <label htmlFor="id">아이디</label>
            <input
              type="text"
              name="id"
              id="id"
              value={formData.id}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              id="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              disabled={loading}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label htmlFor="name">담당자명</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">담당자 이메일</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                style={{ flexGrow: 1 }}
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isCodeSent || loading}
                required
              />
              <Button
                variant="contained"
                onClick={handleSendCode}
                disabled={isCodeSent || loading}
                sx={{ height: '45px', flexShrink: 0 }}
              >
                {loading && !isCodeSent ? (
                  <CircularProgress size={24} />
                ) : isCodeSent ? (
                  '발송됨'
                ) : (
                  '인증 발송'
                )}
              </Button>
            </div>
          </div>

          {isCodeSent && (
            <div className="input-group">
              <label htmlFor="verificationCode">인증 코드 6자리</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  style={{ flexGrow: 1 }}
                  type="text"
                  name="verificationCode"
                  id="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  disabled={isCodeConfirmed || verifyLoading}
                  required
                />
                <Button
                  variant="contained"
                  onClick={handleCheckCode}
                  disabled={isCodeConfirmed || verifyLoading}
                  sx={{
                    height: '45px',
                    flexShrink: 0,
                    backgroundColor: isCodeConfirmed ? 'grey' : undefined,
                  }}
                >
                  {verifyLoading ? (
                    <CircularProgress size={24} />
                  ) : isCodeConfirmed ? (
                    '확인됨'
                  ) : (
                    '인증 확인'
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="phone_number">담당자 전화번호</label>
            <input
              type="tel"
              name="phone_number"
              id="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <div style={{ fontSize: '0.75rem', color: 'grey', marginTop: '4px' }}>
              '-' 없이 숫자만 입력해주세요.
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="verificationFile">
              인증 파일 첨부 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="file"
              name="verificationFile"
              id="verificationFile"
              onChange={handleFileChange}
              disabled={loading}
              accept=".pdf,.jpg,.jpeg,.png"
              required
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'grey', marginTop: '4px' }}>
              사업자등록증 등 기업 인증 서류 (PDF, JPG, PNG / 최대 10MB)
            </div>
            {verificationFile && (
              <div style={{ fontSize: '0.75rem', color: 'green', marginTop: '4px' }}>
                ✓ {verificationFile.name} ({(verificationFile.size / 1024 / 1024).toFixed(2)}MB)
              </div>
            )}
            {fileError && (
              <div style={{ fontSize: '0.75rem', color: 'red', marginTop: '4px' }}>
                {fileError}
              </div>
            )}
          </div>

          <button type="submit" className="sign" disabled={!isCodeConfirmed || loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : '가입하기'}
          </button>
        </form>
      </div>
    </StyledFormWrapper>
  );
}
