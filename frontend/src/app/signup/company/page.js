'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Container, Typography, Box, Alert, CircularProgress, Autocomplete } from '@mui/material';
import { sendVerificationEmail, checkVerificationCode, searchCompanies, signupCompany } from '@/api';
import { StyledFormWrapper } from '@/components/StyledForm';
import { debounce } from '@mui/material/utils';

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

    const handleChange = (e) => {
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
            debounce((input) => {
                if (input) {
                    searchCompanies(input)
                        .then(response => {
                            setCompanyOptions(response.data || []);
                        })
                        .catch(_ => setCompanyOptions([]));
                }
            }, 400),
        [],
    );

    useEffect(() => {
        fetchCompanies(companyInputValue);
    }, [companyInputValue, fetchCompanies]);

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
            .catch(err => setError(err.response?.data || '인증 코드 발송에 실패했습니다.'))
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
            .catch(err => setError(err.response?.data || '인증 코드 확인에 실패했습니다.'))
            .finally(() => setVerifyLoading(false));
    };

    // --- 최종 제출 로직 ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!isCodeConfirmed) {
            return setError("이메일 인증을 먼저 완료해주세요.");
        }
        if (!formData.companyIdx) {
            return setError("회사를 선택해주세요.");
        }
        if (!formData.id || !formData.password || !formData.name || !formData.phone_number) {
            return setError("필수 항목을 모두 입력해주세요.");
        }
        if (formData.password !== formData.passwordConfirm) {
            return setError("비밀번호가 일치하지 않습니다.");
        }

        setLoading(true);
        signupCompany(formData)
            .then(() => {
                alert("기업 회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
                router.push('/login');
            })
            .catch(err => setError(err.response?.data || '회원가입에 실패했습니다.'))
            .finally(() => setLoading(false));
    };

    return (
        <StyledFormWrapper>
            <div className="form-container">
                <p className="title">기업 회원가입</p>

                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{successMessage}</Alert>}
                
                <form className="form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label htmlFor="companyName">회사명</label>
                        <Autocomplete
                            fullWidth
                            getOptionLabel={(option) => option.companyName || ""}
                            filterOptions={(x) => x}
                            options={companyOptions}
                            autoComplete
                            includeInputInList
                            filterSelectedOptions
                            value={selectedCompany}
                            noOptionsText="검색 결과가 없습니다."
                            onChange={(event, newValue) => {
                                setCompanyOptions(newValue ? [newValue, ...companyOptions] : companyOptions);
                                setSelectedCompany(newValue);
                                setFormData(prev => ({ ...prev, companyIdx: newValue ? newValue.companyIdx : null }));
                            }}
                            onInputChange={(event, newInputValue) => {
                                setCompanyInputValue(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} variant="outlined" fullWidth />
                            )}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="id">아이디</label>
                        <input type="text" name="id" id="id" value={formData.id} onChange={handleChange} disabled={loading} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">비밀번호</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} disabled={loading} required autoComplete="new-password" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="passwordConfirm">비밀번호 확인</label>
                        <input type="password" name="passwordConfirm" id="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} disabled={loading} required autoComplete="new-password" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="name">담당자명</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} disabled={loading} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">담당자 이메일</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input style={{ flexGrow: 1 }} type="email" name="email" id="email" value={formData.email} onChange={handleChange} disabled={isCodeSent || loading} required />
                            <Button variant="contained" onClick={handleSendCode} disabled={isCodeSent || loading} sx={{ height: '45px', flexShrink: 0 }}>
                                {loading && !isCodeSent ? <CircularProgress size={24} /> : (isCodeSent ? '발송됨' : '인증 발송')}
                            </Button>
                        </div>
                    </div>

                    {isCodeSent && (
                        <div className="input-group">
                            <label htmlFor="verificationCode">인증 코드 6자리</label>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input style={{ flexGrow: 1 }} type="text" name="verificationCode" id="verificationCode" value={formData.verificationCode} onChange={handleChange} disabled={isCodeConfirmed || verifyLoading} required />
                                <Button variant="contained" onClick={handleCheckCode} disabled={isCodeConfirmed || verifyLoading} sx={{ height: '45px', flexShrink: 0, backgroundColor: isCodeConfirmed ? 'grey' : undefined }}>
                                    {verifyLoading ? <CircularProgress size={24} /> : (isCodeConfirmed ? '확인됨' : '인증 확인')}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="phone_number">담당자 전화번호</label>
                        <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleChange} disabled={loading} required />
                        <div style={{ fontSize: '0.75rem', color: 'grey', marginTop: '4px' }}>'-' 없이 숫자만 입력해주세요.</div>
                    </div>

                    <button type="submit" className="sign" disabled={!isCodeConfirmed || loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : '가입하기'}
                    </button>
                </form>
            </div>
        </StyledFormWrapper>
    );
}
