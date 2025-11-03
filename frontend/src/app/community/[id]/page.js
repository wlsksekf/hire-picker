'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation'; // Next.js App Router 표준 경로로 변경

// Next.js가 URL 경로에서 {id} 값을 props로 전달해줍니다.
export default function PostDetailPage({ params }) {
    // useRouter 훅을 사용하여 페이지 이동 기능을 활성화합니다.
    const router = useRouter(); 
    
    // React.use()를 사용하여 params Promise를 풀고 실제 객체를 얻습니다. 
    const actualParams = React.use(params);
    const postIdx = Number(actualParams.id); // URL 경로의 post_idx (예: 10)
    
    const api_url = `/api/posts/${postIdx}`;  // 상세 API 주소
    const [post, setPost] = useState(null); // 게시글 상세 데이터를 저장할 상태
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(''); // 에러 메시지 상태 추가 (alert 대체)

    // --- 1. 이벤트 핸들러: 버튼 클릭 시 동작 정의 ---
    
    const handleEdit = () => {
        // 수정 페이지로 이동 (postIdx를 URL 파라미터로 전달)
        router.push(`/community/${postIdx}/edit`);
    };

    const handleDelete = () => {
        // NOTE: window.confirm() 대신 커스텀 모달 UI를 사용해야 하지만, 
        // 여기서는 임시 메시지를 표시합니다.
        console.log(`게시글 ID ${postIdx} 삭제 요청을 시도합니다.`);
        
        // 실제 삭제 API 호출 로직 (예시):
        /* axios.delete(api_url)
            .then(() => router.push('/community'))
            .catch(error => setErrorMsg('삭제 중 오류가 발생했습니다.')); 
        */

        setErrorMsg('⚠️ 삭제 기능은 현재 구현되지 않았습니다. (ID: ' + postIdx + ')');
    };

    const handleList = () => {
        // 목록 페이지로 이동
        router.push('/community');
    };
    // ---------------------------------------------

    useEffect(() => {
        axios.get(api_url)
            .then(response => {
                // 백엔드 응답 구조 (ResultData)에 맞게 데이터 추출
                if (response.data.msg === 'success' && response.data.data) {
                    setPost(response.data.data);
                } else {
                    // alert() 대신 상태를 업데이트하여 에러 메시지 표시
                    setErrorMsg('게시글을 찾을 수 없거나 데이터 형식이 올바르지 않습니다.');
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("상세 데이터 로딩 오류:", error);
                setErrorMsg('데이터 통신 중 심각한 오류가 발생했습니다.');
                setLoading(false);
            });
    }, [postIdx]);

    // 버튼 스타일을 위한 기본 설정 (인라인 스타일)
    const buttonStyle = {
        padding: '10px 15px',
        margin: '0 5px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s, transform 0.1s',
        minWidth: '80px',
    };

    if (loading) {
        return <div style={{padding: '40px', textAlign: 'center', fontSize: '1.2em'}}>로딩 중...</div>;
    }

    // 에러 발생 시 메시지 표시 (게시글 로드 실패 등)
    if (errorMsg && !post) {
        return <div style={{padding: '40px', textAlign: 'center', color: '#e60000', border: '1px solid #ffcccc', backgroundColor: '#fffafa', borderRadius: '8px', margin: '40px auto', width: '80%'}}>
            <p style={{marginBottom: '15px', fontWeight: 'bold'}}>{errorMsg}</p>
            <button 
                onClick={handleList} 
                style={{ ...buttonStyle, backgroundColor: '#f0f0f0', borderColor: '#ccc' }}
            >
                목록으로 돌아가기
            </button>
        </div>;
    }

    if (!post) {
        return <div style={{padding: '20px', textAlign: 'center'}}>게시글이 존재하지 않습니다.</div>;
    }

    return (
        <div style={{width: '80%', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
            
            {/* 게시글 제목 영역 */}
            <h1 style={{fontSize: '2.2em', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '15px'}}>{post.title}</h1>
            
            {/* 메타 정보 영역 */}
            <p style={{fontSize: '0.9em', color: '#666', marginBottom: '30px', borderBottom: '1px dashed #eee', paddingBottom: '10px'}}>
                번호: {post.postIdx} | 작성자: {post.nickname} | 등록일: {post.createdAt} | 조회수: {post.viewCount}
            </p>
            
            {/* 본문 내용 영역 */}
            <div style={{minHeight: '200px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.1em', padding: '10px 0'}}>
                {post.content}
            </div>

            <hr style={{borderColor: '#f0f0f0', marginTop: '40px', marginBottom: '20px'}} />

            {/* --- 2. 버튼 영역: 목록, 수정, 삭제 --- */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between', // 목록 버튼은 왼쪽, 수정/삭제는 오른쪽
                alignItems: 'center'
            }}>
                {/* 왼쪽: 목록 버튼 */}
                <div>
                    <button 
                        onClick={handleList} 
                        style={{ 
                            ...buttonStyle, 
                            backgroundColor: '#f0f0f0', 
                            color: '#333',
                            borderColor: '#ccc'
                        }}
                    >
                        목록
                    </button>
                </div>

                {/* 오른쪽: 수정 / 삭제 버튼 */}
                <div>
                    <button 
                        onClick={handleEdit} 
                        style={{ 
                            ...buttonStyle, 
                            backgroundColor: '#5bc0de', // 파란색 계열
                            color: 'white',
                            borderColor: '#46b8da'
                        }}
                    >
                        수정
                    </button>

                    <button 
                        onClick={handleDelete} 
                        style={{ 
                            ...buttonStyle, 
                            backgroundColor: '#d9534f', // 빨간색 계열
                            color: 'white',
                            borderColor: '#d43f3a'
                        }}
                    >
                        삭제
                    </button>
                </div>
            </div>
            {/* 버튼 클릭 후 임시 에러 메시지/피드백 표시 영역 */}
            {errorMsg && (
                 <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffe6e6', color: '#cc0000', border: '1px solid #ffb3b3', borderRadius: '4px', textAlign: 'center' }}>
                    {errorMsg}
                </div>
            )}
        </div>
    );
}
