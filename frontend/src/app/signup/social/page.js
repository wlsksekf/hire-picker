'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Autocomplete } from '@react-google-maps/api';
import { api } from '@/api';
import useAuthStore from '@/store/authStore';
import { StyledFormWrapper } from '@/components/StyledForm';

const genders = [
    { value: '', label: '선택 안함' },
    { value: 'MALE', label: '남성' },
    { value: 'FEMALE', label: '여성' },
];

// 소셜 로그인 후 추가 정보 입력 페이지
export default function SocialSignupPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    const [formData, setFormData] = useState({
        nickname: '',
        gender: '',
        phone_number: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const autocompleteRef = useRef(null);

    // 페이지 접근 시 인증 상태 확인
    useEffect(() => {
        if (!isAuthenticated || !user) {
            // 인증 정보가 없으면 로그인 페이지로 리디렉션
            router.replace('/login');
        }
    }, [isAuthenticated, user, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone_number') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            setFormData(prevData => ({ ...prevData, [name]: onlyNums }));
        } else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
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

        if (!formData.nickname || !formData.phone_number) {
            setError('닉네임과 전화번호는 필수 입력 항목입니다.');
            setLoading(false);
            return;
        }

        const dataToSend = {
            ...formData,
            gender: formData.gender === '' ? null : formData.gender,
        };

        // 백엔드의 추가 정보 업데이트 API 호출
        api.patch('/api/users/me/details', dataToSend)
            .then(() => {
                alert('추가 정보가 성공적으로 저장되었습니다. 메인 페이지로 이동합니다.');
                // 유저 정보 다시 불러오기 (선택적)
                return useAuthStore.getState().initializeAuth();
            })
            .then(() => {
                router.push('/');
            })
            .catch(err => {
                setError(err.response?.data?.message || '정보 저장에 실패했습니다. 다시 시도해주세요.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 인증 정보 로딩 중이거나 없을 때
    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <StyledFormWrapper>
            <div className="form-container">
                <p className="title">추가 정보 입력</p>
                <Typography sx={{ textAlign: 'center', mt: 1, mb: 3 }}>
                    소셜 계정으로 가입을 완료하기 위해 추가 정보를 입력해주세요.
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <form className="form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label>이메일</label>
                        <TextField fullWidth value={user.email} disabled />
                    </div>

                    <div className="input-group">
                        <label>이름</label>
                        <TextField fullWidth value={user.name} disabled />
                    </div>

                    <div className="input-group">
                        <label htmlFor="nickname">닉네임</label>
                        <TextField
                            id="nickname"
                            name="nickname"
                            fullWidth
                            value={formData.nickname}
                            onChange={handleChange}
                            required
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
                            required
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
                            />
                        </Autocomplete>
                    </div>

                    <button type="submit" className="sign" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : '가입 완료'}
                    </button>
                </form>
            </div>
        </StyledFormWrapper>
    );
}
