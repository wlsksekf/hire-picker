'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation'; 


// ✅ 카테고리 목록 정의
const BOARD_CATEGORIES = [
    { value: '', label: '카테고리 선택' }, // 기본값
    { value: '1', label: '취준/이직' },
    { value: '2', label: '회사생활/커리어' },
    { value: '3', label: '자유주제' },
    { value: '4', label: '아티클' },
];

export default function PostWritePage() {
    // 고객님의 환경이 완벽하므로, Next.js의 useRouter를 그대로 사용합니다.
    const router = useRouter(); 
    
    // 폼 데이터 상태 (제목, 내용)
    // ✅ board_idx 상태 추가 및 기본값 설정
    const [formData, setFormData] = useState({ title: '', content: '', board_idx: '' }); 
    
    // 파일 첨부 상태 (파일 객체와 미리보기 URL)
    const [fileState, setFileState] = useState({ 
        selectedFile: null, 
        previewUrl: null 
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태
    const [message, setMessage] = useState(''); // 피드백 메시지 (성공/에러)

    // API 엔드포인트 (실제 백엔드 API Route 또는 서버 주소로 변경하세요.)
    const write_api_url = `/api/posts/write`; 

    // 1. 입력 필드 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // 2. 파일 입력 변경 및 미리보기 핸들러 (기존과 동일)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (fileState.previewUrl) URL.revokeObjectURL(fileState.previewUrl);
        if (file) {
            setFileState({ selectedFile: file, previewUrl: URL.createObjectURL(file) });
            setMessage(''); 
        } else {
            setFileState({ selectedFile: null, previewUrl: null });
        }
    };
    
    // 3. 파일 삭제 핸들러 (기존과 동일)
    const handleRemoveFile = () => {
        if (fileState.previewUrl) URL.revokeObjectURL(fileState.previewUrl);
        setFileState({ selectedFile: null, previewUrl: null });
        setMessage('파일 첨부가 취소되었습니다.');
    };

    // 4. 게시글 제출(작성) 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        // ✅ 카테고리 입력 유효성 검사 추가
        if (!formData.title || !formData.content || !formData.board_idx) {
            setMessage('⚠️ 제목, 내용, 그리고 카테고리를 모두 선택해주세요.');
            return;
        }

        setIsSubmitting(true);

        // FormData에 텍스트와 파일을 추가
        const postData = new FormData();
        postData.append('title', formData.title);
        postData.append('content', formData.content);
        // ✅ board_idx 데이터 추가
        postData.append('board_idx', formData.board_idx); 
        
        if (fileState.selectedFile) {
            // 백엔드에서 파일을 받는 필드명과 일치시켜야 합니다.
            postData.append('image', fileState.selectedFile); 
        }

        try {
            // withCredentials: true를 설정하여 브라우저가 HttpOnly 쿠키를 자동으로 첨부하도록 합니다.
            const response = await axios.post(write_api_url, postData, {
                withCredentials: true, 
            });

            // 성공 처리: 백엔드 응답에서 게시글 ID 추출
            const postId = response.data?.postId || response.data?.id || 'new'; 
            
            setMessage(`✅ 게시글 작성이 완료되었습니다. ID: ${postId}`);
            
            // 폼 초기화 (board_idx도 초기화)
            setFormData({ title: '', content: '', board_idx: '' }); 
            handleRemoveFile(); 
            
            // 성공 후 상세 페이지로 이동
            setTimeout(() => {
                router.push(`/community/${postId}`); 
            }, 1000);

        } catch (error) {
            console.error("게시글 작성 중 오류 발생:", error);
            
            let errorMessage = '⚠️ 게시글 작성 중 서버 오류가 발생했습니다.';
            
            // 401 Unauthorized 에러 특별 처리 (인증 실패)
            if (error.response?.status === 401) {
                // HttpOnly 쿠키가 유효하지 않거나 없는 경우
                errorMessage = '🚫 인증 실패! 로그인 세션이 만료되었습니다. 다시 로그인해 주세요.';
                // 로그인 페이지로 리다이렉트
                setTimeout(() => router.push('/login'), 1500); 
            } else {
                 errorMessage = error.response?.data?.message || errorMessage;
            }

            setMessage(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. 취소 버튼 핸들러: 목록 페이지로 돌아가기 (기존과 동일)
    const handleCancel = () => {
        router.push('/community');
    };

    // 6. 컴포넌트 unmount 시 메모리 해제 (기존과 동일)
    useEffect(() => {
        return () => {
            if (fileState.previewUrl) {
                URL.revokeObjectURL(fileState.previewUrl);
            }
        };
    }, [fileState.previewUrl]);


    // 스타일 설정 (JSX와 함께 포함)
    const inputStyle = {
        width: '100%',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        fontSize: '1.1em',
        boxSizing: 'border-box',
        marginBottom: '20px'
    };
    
    // ✅ Select 박스 스타일 추가
    const selectStyle = {
        ...inputStyle,
        appearance: 'none', // 기본 브라우저 스타일 제거
        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\' stroke=\'currentColor\'%3e%3cpath d=\'M6 9l4 4 4-4\'/%3e%3c/svg%3e")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.7em top 50%',
        backgroundSize: '1.2em',
        paddingRight: '2.5em',
        cursor: 'pointer'
    };

    return (
        <div style={{width: '80%', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: '#fff'}}>
            <h1 style={{fontSize: '2.5em', borderBottom: '3px solid #007bff', paddingBottom: '15px', marginBottom: '30px', color: '#333'}}>
                새 게시글 작성
            </h1>
            
            <form onSubmit={handleSubmit}>
                
                {/* ✅ 카테고리 선택 필드 추가 */}
                <div>
                    <label htmlFor="board_idx" style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>
                        카테고리 선택
                    </label>
                    <select
                        id="board_idx"
                        name="board_idx"
                        value={formData.board_idx}
                        onChange={handleChange}
                        style={selectStyle}
                        disabled={isSubmitting}
                    >
                        {BOARD_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value} disabled={cat.value === ''}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 제목 입력 필드 (기존과 동일) */}
                <div>
                    <label htmlFor="title" style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>
                        제목
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="제목을 입력해주세요."
                        disabled={isSubmitting}
                    />
                </div>

                {/* 내용 입력 필드 (Textarea) (기존과 동일) */}
                <div>
                    <label htmlFor="content" style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555'}}>
                        내용
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows="15"
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder="내용을 입력해주세요."
                        disabled={isSubmitting}
                    />
                </div>

                {/* --- 파일 첨부 영역 --- (기존과 동일) */}
                <div style={{ marginBottom: '30px', border: '1px dashed #ccc', padding: '20px', borderRadius: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#555' }}>
                        이미지 파일 첨부 (선택 사항)
                    </label>
                    <input
                        type="file"
                        accept="image/*" // 이미지 파일만 허용
                        onChange={handleFileChange}
                        style={{ display: 'none' }} // 실제 input은 숨김
                        id="file-upload-input"
                        disabled={isSubmitting}
                    />
                    
                    {/* MUI Button 스타일을 흉내낸 커스텀 버튼 */}
                    <label 
                        htmlFor="file-upload-input" 
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {fileState.selectedFile ? '파일 변경' : '파일 선택'}
                    </label>
                    
                    {/* 파일 미리보기 및 정보 */}
                    {fileState.selectedFile && (
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <div style={{ flexShrink: 0 }}>
                                <img 
                                    src={fileState.previewUrl} 
                                    alt="파일 미리보기" 
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} 
                                />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '5px', wordBreak: 'break-all' }}>
                                    첨부된 파일: {fileState.selectedFile.name}
                                </p>
                                <p style={{ fontSize: '0.9em', color: '#666' }}>
                                    크기: {(fileState.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <Button 
                                    onClick={handleRemoveFile} 
                                    color="error" 
                                    variant="outlined"
                                    sx={{ marginTop: '10px' }}
                                >
                                    첨부 취소
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                {/* --- 파일 첨부 영역 끝 --- */}


                {/* 에러/메시지 표시 영역 (기존과 동일) */}
                {message && (
                    <div style={{ 
                        marginTop: '15px', 
                        padding: '12px', 
                        backgroundColor: message.startsWith('✅') ? '#e6ffe6' : '#ffe6e6', 
                        color: message.startsWith('✅') ? '#008000' : '#cc0000', 
                        border: '1px solid', 
                        borderColor: message.startsWith('✅') ? '#b3ffb3' : '#ffb3b3',
                        borderRadius: '6px', 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        marginBottom: '20px'
                    }}>
                        {message}
                    </div>
                )}

                {/* 버튼 그룹 (기존과 동일) */}
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <Button 
                        type="button" 
                        onClick={handleCancel}
                        variant="outlined"
                        sx={{
                            padding: '12px 25px',
                            fontWeight: 'bold',
                            color: '#495057',
                            borderColor: '#ccc'
                        }}
                        disabled={isSubmitting}
                    >
                        취소
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{
                            padding: '12px 25px',
                            fontWeight: 'bold',
                            backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                        }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '작성 중...' : '작성 완료'}
                    </Button>
                </div>
            </form>
        </div>
    );
}