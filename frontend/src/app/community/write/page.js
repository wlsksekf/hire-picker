'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation'; 


export default function PostWritePage() {
    // 고객님의 환경이 완벽하므로, Next.js의 useRouter를 그대로 사용합니다.
    const router = useRouter(); 
    
    // 폼 데이터 상태 (제목, 내용)
    const [formData, setFormData] = useState({ title: '', content: '' });
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

    // 2. 파일 입력 변경 및 미리보기 핸들러
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
    
    // 3. 파일 삭제 핸들러
    const handleRemoveFile = () => {
        if (fileState.previewUrl) URL.revokeObjectURL(fileState.previewUrl);
        setFileState({ selectedFile: null, previewUrl: null });
        setMessage('파일 첨부가 취소되었습니다.');
    };

    // 4. 게시글 제출(작성) 핸들러 (HttpOnly Cookie 기반 로직 적용)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        if (!formData.title || !formData.content) {
            setMessage('제목과 내용을 모두 입력해주세요.');
            return;
        }

        // ⭐ HttpOnly 방식에서는 클라이언트에서 토큰을 읽을 수 없으므로, 
        // 로컬 토큰 검사 없이 바로 요청을 보냅니다. 서버가 401로 응답할 때까지 기다립니다.

        setIsSubmitting(true);

        // FormData에 텍스트와 파일을 추가
        const postData = new FormData();
        postData.append('title', formData.title);
        postData.append('content', formData.content);
        if (fileState.selectedFile) {
            // 백엔드에서 파일을 받는 필드명과 일치시켜야 합니다.
            postData.append('image', fileState.selectedFile); 
        }

        try {
            // ⭐ 1. withCredentials: true를 설정하여 브라우저가 HttpOnly 쿠키를 자동으로 첨부하도록 합니다.
            // ⭐ 2. Authorization 헤더 설정은 제거합니다.
            const response = await axios.post(write_api_url, postData, {
                withCredentials: true, 
                // headers: { 'Authorization': ... } 제거됨
            });

            // 성공 처리: 백엔드 응답에서 게시글 ID 추출
            const postId = response.data?.postId || response.data?.id || 'new'; 
            
            setMessage(`✅ 게시글 작성이 완료되었습니다. ID: ${postId}`);
            
            setFormData({ title: '', content: '' }); 
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

    // 5. 취소 버튼 핸들러: 목록 페이지로 돌아가기
    const handleCancel = () => {
        router.push('/community');
    };

    // 6. 컴포넌트 unmount 시 메모리 해제
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

    return (
        <div style={{width: '80%', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: '#fff'}}>
            <h1 style={{fontSize: '2.5em', borderBottom: '3px solid #007bff', paddingBottom: '15px', marginBottom: '30px', color: '#333'}}>
                새 게시글 작성
            </h1>
            
            <form onSubmit={handleSubmit}>
                {/* 제목 입력 필드 */}
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

                {/* 내용 입력 필드 (Textarea) */}
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

                {/* --- 파일 첨부 영역 --- */}
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


                {/* 에러/메시지 표시 영역 */}
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

                {/* 버튼 그룹 */}
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