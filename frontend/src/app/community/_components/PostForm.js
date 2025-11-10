'use client'; 

import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
// ✅ 1. next/navigation에서 useRouter를 import 해야 합니다.
import { useRouter } from 'next/navigation'; 
import { createPost, updatePost } from '@/lib/actions';
// 임시 데이터 배열 (실제 데이터 수정 테스트를 위해 여기에 정의합니다.)
const TEMP_POSTS_DATA = [
  { id: '1', title: '첫 번째 글입니다.', content: '상세 내용 1...', author: '홍길동', createdAt: '2025.10.01', views: 120 },
  { id: '2', title: '합격 후기 공유드립니다.', content: '상세 내용 2...', author: '행복취준생', createdAt: '2025.10.25', views: 321 },
  { id: '3', title: '면접 때 이 질문 꼭 나옵니다!', content: '상세 내용 3...', author: '김멘토', createdAt: '2025.10.26', views: 88 },
];

export default function PostForm({ isEdit = false, initialData = {} }) {
  // ✅ 2. 컴포넌트 내부에서 useRouter()를 호출하여 router 객체를 초기화해야 합니다.
  const router = useRouter(); 
  
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !content) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    // 이 부분에서 실제 데이터를 수정하는 로직을 임시로 구현합니다.
    if (isEdit) {
        const postIdToUpdate = initialData.id; 
        const success = await updatePost(postIdToUpdate, title, content);//서버액션 호출
    
    if(success) {
        alert('게시글이 수정되었습니다.');
        router.push('/community/${postIdToUpdate}');
    }else {
        alert('수정실패: 게시글을 찾을 수 없습니다.');
    }
    }else {
        //작성 로직: 서버 액션 호출
        const newPostId = await createPost(title, content); //서버액션 호출
        
        if(newPostId){
            alert('새 게시글이 작성되었습니다.');
            router.push('/community');
        }else {
            alert('작성 실패.');
        }
    } 
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        {isEdit ? '게시글 수정' : '새 글 작성'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 제목 입력 필드 */}
        <TextField
          label="제목"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        {/* 내용 입력 필드 */}
        <TextField
          label="내용"
          variant="outlined"
          fullWidth
          multiline
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        
        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? '수정 완료' : '작성 완료'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
