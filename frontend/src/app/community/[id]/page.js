'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

// Next.js가 URL 경로에서 {id} 값을 props로 전달해줍니다.
export default function PostDetailPage({ params }) {
    const postIdx = Number(params.id); // URL 경로의 post_idx (예: 10)
    const api_url = `/api/posts/${postIdx}`;  //상세 API 주소
    const [post, setPost] = useState(null); // 게시글 상세 데이터를 저장할 상태
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(api_url)
            .then(response => {
                // 백엔드 응답 구조 (ResultData)에 맞게 데이터 추출
                if (response.data.msg === 'success' && response.data.data) {
                    setPost(response.data.data);
                } else {
                    alert('게시글을 찾을 수 없습니다.');
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("상세 데이터 로딩 오류:", error);
                setLoading(false);
            });
    }, [postIdx]);

    if (loading) {
        return <div style={{padding: '20px'}}>로딩 중...</div>;
    }

    if (!post) {
        return <div style={{padding: '20px'}}>게시글이 존재하지 않습니다.</div>;
    }

    return (
        <div style={{width: '80%', margin: '40px auto', padding: '20px', border: '1px solid #ccc'}}>
            <h1>{post.title}</h1>
            <p>번호: {post.post_idx} | 작성자: {post.p_user_idx} | 등록일: {post.created_at} | 조회수: {post.view_count}</p>
            <hr />
            <div style={{minHeight: '200px', whiteSpace: 'pre-wrap'}}>
                {post.content}
            </div>
        </div>
    );
}