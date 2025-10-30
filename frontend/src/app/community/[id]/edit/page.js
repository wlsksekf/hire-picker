// app/community/[id]/edit/page.js
import React from 'react';
import { Container, Typography } from '@mui/material';
import PostForm from '../../_components/PostForm'; // PostForm 재활용

// 임시 데이터 (상세 페이지와 동일하게 사용합니다)
const TEMP_POSTS = [
  { id: '1', title: '첫 번째 글입니다.', content: '상세 내용 1...', author: '홍길동', createdAt: '2025.10.01', views: 120 },
  { id: '2', title: '합격 후기 공유드립니다.', content: '상세 내용 2...', author: '행복취준생', createdAt: '2025.10.25', views: 321 },
  { id: '3', title: '면접 때 이 질문 꼭 나옵니다!', content: '상세 내용 3...', author: '김멘토', createdAt: '2025.10.26', views: 88 },
];

// params를 통해 수정할 게시글의 ID를 가져옵니다.
export default function EditPostPage({ params }) {
  const postId = params.id;
  
  // 1. 서버에서 기존 게시글 데이터 가져오기 (실제 API 호출 부분)
  const postToEdit = TEMP_POSTS.find(p => p.id === postId);

  if (!postToEdit) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography variant="h5" color="error" align="center">
          수정할 게시글을 찾을 수 없습니다. (ID: {postId})
        </Typography>
      </Container>
    );
  }

  // **권한 검사 로직:** 실제로는 여기서 현재 로그인 사용자와 postToEdit.author를 비교해야 합니다.
  // if (currentUser.id !== postToEdit.authorId) { return <AccessDenied /> }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* PostForm 컴포넌트를 재활용하며, 수정 모드(isEdit=true)와 기존 데이터를 전달합니다. */}
      <PostForm 
        isEdit={true} 
        initialData={postToEdit} // 기존 데이터를 폼에 미리 채워 넣습니다.
      />
    </Container>
  );
}