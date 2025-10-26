// app/community/new/page.js
import React from 'react';
import { Container } from '@mui/material';
// 클라이언트 컴포넌트인 PostForm을 가져옵니다.
import PostForm from '../_components/PostForm'; 

// 이 페이지는 서버 컴포넌트입니다.
export default function NewPostPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* 폼 로직이 필요한 부분만 PostForm 컴포넌트에 위임합니다. */}
      <PostForm 
        isEdit={false} // 새 글 작성 페이지이므로 false
      />
    </Container>
  );
}