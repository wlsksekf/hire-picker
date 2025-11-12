'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Image 컴포넌트 임포트
import { Button, TextField, Container, Typography, Box, Alert, CircularProgress, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { sendVerificationEmail, checkVerificationCode, signupPersonal } from '@/api'; // checkVerificationCode 임포트
import { StyledFormWrapper } from '@/components/StyledForm';

const genders = [
    { value: '', label: '선택 안함' },
    { value: 'MALE', label: '남성' },
    { value: 'FEMALE', label: '여성' },
];

const libraries = ['places'];

export default function SignupPage() {
    const router = useRouter();

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        name: '',
        gender: '', // 기본값을 빈 문자열로 변경
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
    const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
    const [bonusAmount, setBonusAmount] = useState(5000);

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

    const handleBonusDialogClose = () => {
        setBonusDialogOpen(false);
        router.push('/login');
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

        // gender가 빈 문자열일 경우 null로 변환하여 전송
        const dataToSend = {
            ...formData,
            gender: formData.gender === '' ? null : formData.gender,
        };

        signupPersonal(dataToSend)
            .then((response) => {
                const message = response?.data?.message;
                if (message) {
                    setSuccessMessage(message);
                }
                const bonus = response?.data?.bonusAmount ?? 5000;
                setBonusAmount(bonus);
                setBonusDialogOpen(true);
            })
            .catch(err => {
                setError(err.response?.data || '회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const renderAddressInput = () => {
        if (loadError) {
            return <TextField fullWidth disabled value="주소 검색을 사용할 수 없습니다." />;
        }

        if (!isLoaded) {
            return <TextField fullWidth disabled value="주소 검색 로딩 중..." />;
        }

        return (
            <Autocomplete
                onLoad={handleAutocompleteLoad}
                onPlaceChanged={handlePlaceChanged}
            >
                <TextField
                    id="address"
                    name="address"
                    fullWidth
                    value={formData.address}
                    onChange={handleAddressChange}
                    disabled={!isCodeConfirmed}
                />
            </Autocomplete>
        );
    };

    return (
        <StyledFormWrapper>
            <div className="form-container">
                <p className="title">회원가입</p>

                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{typeof error === 'object' ? error.message : error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{typeof successMessage === 'object' ? successMessage.message : successMessage}</Alert>}

                <form className="form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label htmlFor="email">이메일</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <TextField
                                id="email"
                                name="email"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                disabled={isCodeSent}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSendCode}
                                disabled={isCodeSent || loading}
                                sx={{ flexShrink: 0, width: '120px' }}
                            >
                                {loading ? <CircularProgress size={24} /> : '인증코드 발송'}
                            </Button>
                        </div>
                    </div>

                    {isCodeSent && (
                        <div className="input-group">
                            <label htmlFor="verificationCode">인증코드</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <TextField
                                    id="verificationCode"
                                    name="verificationCode"
                                    fullWidth
                                    value={formData.verificationCode}
                                    onChange={handleChange}
                                    placeholder="6자리 코드를 입력하세요"
                                    disabled={isCodeConfirmed}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleCheckCode}
                                    disabled={isCodeConfirmed || verifyLoading}
                                    sx={{ flexShrink: 0, width: '120px' }}
                                >
                                    {verifyLoading ? <CircularProgress size={24} /> : '코드 확인'}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label htmlFor="password">비밀번호</label>
                        <TextField
                            id="password"
                            name="password"
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={handleChange}
                            disabled={!isCodeConfirmed}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="passwordConfirm">비밀번호 확인</label>
                        <TextField
                            id="passwordConfirm"
                            name="passwordConfirm"
                            type="password"
                            fullWidth
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            disabled={!isCodeConfirmed}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="name">이름</label>
                        <TextField
                            id="name"
                            name="name"
                            fullWidth
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isCodeConfirmed}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="nickname">닉네임</label>
                        <TextField
                            id="nickname"
                            name="nickname"
                            fullWidth
                            value={formData.nickname}
                            onChange={handleChange}
                            disabled={!isCodeConfirmed}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="phone_number">전화번호</label>
                        <TextField
                            id="phone_number"
                            name="phone_number"
                            fullWidth
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="- 없이 숫자만 입력"
                            disabled={!isCodeConfirmed}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="gender">성별</label>
                        <TextField
                            id="gender"
                            name="gender"
                            select
                            fullWidth
                            value={formData.gender}
                            onChange={handleChange}
                            disabled={!isCodeConfirmed}
                        >
                            {genders.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    <div className="input-group">
                        <label htmlFor="address">주소</label>
                        {renderAddressInput()}
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
                <div className="social-icons" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                    <a href="/api/oauth2/authorization/google" aria-label="Log in with Google" className="icon">
                        <Image src="/assets/google-logo.svg" alt="Google a-logo" width={40} height={40} />
                    </a>
                    <a href="/api/oauth2/authorization/naver" aria-label="Log in with Naver" className="icon">
                        <Image src="/assets/naver_logo.png" alt="Naver logo" width={40} height={40} />
                    </a>
                    <a href="/api/oauth2/authorization/kakao" aria-label="Log in with Kakao" className="icon">
                        <Image src="/assets/kakao-logo.svg" alt="Kakao logo" width={40} height={40} />
                    </a>
                </div>

                <Dialog open={bonusDialogOpen} onClose={handleBonusDialogClose}>
                    <DialogTitle>회원가입 완료</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            환영합니다! 신규 가입 축하 보너스로 {bonusAmount?.toLocaleString?.() ?? bonusAmount} 크레딧이 지급되었습니다.
                            로그인 후 마이페이지에서 잔액을 확인해 보세요.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleBonusDialogClose} autoFocus>
                            확인
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        </StyledFormWrapper>
    );
}
