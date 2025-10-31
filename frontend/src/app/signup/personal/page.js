'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Container, Typography, Box, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { sendVerificationEmail, checkVerificationCode, signupPersonal } from '@/api'; // checkVerificationCode 임포트
import { StyledFormWrapper } from '@/components/StyledForm';

const genders = [
    { value: 'MALE', label: '남성' },
    { value: 'FEMALE', label: '여성' },
    { value: 'OTHER', label: '선택 안함' },
];

export default function SignupPage() {
    const router = useRouter();


    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        name: '',
        gender: 'OTHER',
        phone_number: '',
        address: '',
        verificationCode: '',
    });

    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeConfirmed, setIsCodeConfirmed] = useState(false); // ★ 인증 확인 상태
    const [loading, setLoading] = useState(false); // 전체 제출 로딩
    const [verifyLoading, setVerifyLoading] = useState(false); // 코드 확인 로딩
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const autocompleteRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // ★ 전화번호 필드인 경우 숫자만 남김
        if (name === 'phone_number') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            setFormData(prevData => ({ ...prevData, [name]: onlyNums }));
        } else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    const handleSendCode = () => {
        if (!formData.email) {
            setError('이메일을 입력하세요.');
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
                setError(err.response?.data || '인증 코드 발송에 실패했습니다.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // ★ 인증 코드 확인 핸들러
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
                setSuccessMessage(response.data); // "이메일이 성공적으로 인증되었습니다."
            })
            .catch(err => {
                setError(err.response?.data || '인증 코드 확인에 실패했습니다.');
            })
            .finally(() => {
                setVerifyLoading(false);
            });
    };

    const handleAutocompleteLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const handlePlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place && place.formatted_address) {
                setFormData(prevData => ({ ...prevData, address: place.formatted_address }));
            }
        }
    };
    
    const handleAddressChange = (e) => {
        setFormData(prevData => ({ ...prevData, address: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!isCodeConfirmed) {
            setError("이메일 인증을 먼저 완료해주세요.");
            setLoading(false);
            return;
        }

        // ★ 전화번호 필드 유효성 검사 추가
        if (!formData.password || !formData.name || !formData.nickname || !formData.phone_number) {
            setError("필수 항목을 모두 입력해주세요.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            setLoading(false);
            return;
        }

        signupPersonal(formData)
            .then(() => {
                alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
                router.push('/login');
            })
            .catch(err => {
                setError(err.response?.data || '회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <StyledFormWrapper>
            <div className="form-container">
                <p className="title">회원가입</p>

                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{typeof error === 'object' ? error.message : error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{typeof successMessage === 'object' ? successMessage.message : successMessage}</Alert>}
                
                <form className="form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label htmlFor="email">이메일 주소</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input style={{ flexGrow: 1 }} type="email" name="email" id="email" value={formData.email} onChange={handleChange} disabled={isCodeSent || loading} required />
                            <Button
                                variant="contained"
                                onClick={handleSendCode}
                                disabled={isCodeSent || loading}
                                sx={{ height: '45px', flexShrink: 0 }}
                            >
                                {loading && !isCodeSent ? <CircularProgress size={24} /> : (isCodeSent ? '발송됨' : '인증 발송')}
                            </Button>
                        </div>
                    </div>

                    {isCodeSent && (
                        <div className="input-group">
                            <label htmlFor="verificationCode">인증 코드 6자리</label>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input style={{ flexGrow: 1 }} type="text" name="verificationCode" id="verificationCode" value={formData.verificationCode} onChange={handleChange} disabled={isCodeConfirmed || verifyLoading} required />
                                <Button
                                    variant="contained"
                                    onClick={handleCheckCode}
                                    disabled={isCodeConfirmed || verifyLoading}
                                    sx={{ height: '45px', flexShrink: 0, backgroundColor: isCodeConfirmed ? 'grey' : undefined }}
                                >
                                    {verifyLoading ? <CircularProgress size={24} /> : (isCodeConfirmed ? '확인됨' : '인증 확인')}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="password">비밀번호</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} disabled={loading} required autoComplete="new-password" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="passwordConfirm">비밀번호 확인</label>
                        <input type="password" name="passwordConfirm" id="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} disabled={loading} required autoComplete="new-password" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="name">이름</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} disabled={loading} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="nickname">닉네임</label>
                        <input type="text" name="nickname" id="nickname" value={formData.nickname} onChange={handleChange} disabled={loading} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="gender">성별</label>
                        <TextField
                            select
                            fullWidth
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            disabled={loading}
                            variant="outlined"
                        >
                            {genders.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    <div className="input-group">
                        <label htmlFor="phone_number">전화번호</label>
                        <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleChange} disabled={loading} required />
                        <div style={{ fontSize: '0.75rem', color: 'grey', marginTop: '4px' }}>'- ' 없이 숫자만 입력해주세요.</div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="address">주소 (자동완성)</label>
                        <Autocomplete
                            onLoad={handleAutocompleteLoad}
                            onPlaceChanged={handlePlaceChanged}
                            options={{ componentRestrictions: { country: 'kr' }, types: ['geocode'] }}
                        >
                            <TextField
                                fullWidth
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleAddressChange}
                                disabled={loading}
                                variant="outlined"
                            />
                        </Autocomplete>
                    </div>

                    <button type="submit" className="sign" disabled={!isCodeConfirmed || loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : '가입하기'}
                    </button>
                </form>

                <div className="social-message">
                    <div className="line" />
                    <p className="message">소셜 계정으로 시작하기</p>
                    <div className="line" />
                </div>
                <div className="social-icons">
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/oauth2/authorization/google`} aria-label="Log in with Google" className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current">
                            <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
                        </svg>
                    </a>
                </div>

            </div>
        </StyledFormWrapper>
    );
}