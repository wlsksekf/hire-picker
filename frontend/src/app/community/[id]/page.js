import React from 'react';
// ✅ Container, Typography, Box, Button, Divider, Paper 등 사용된 모든 컴포넌트를 import 했습니다.
import { Container, Typography, Box, Button, Divider, Paper } from '@mui/material';
import Link from 'next/link';
// 💡 클라이언트 컴포넌트인 PostActions를 가져와 액션 버튼을 처리합니다.
import PostActions from '../_components/PostActions'; 

// 임시 데이터 (id를 문자열로 통일했습니다.)
const TEMP_POSTS = [
  { id: '1', title: '첫 번째 글입니다.', content: '상세 내용 1...', author: '홍길동', createdAt: '2025.10.01', views: 120 },
  { id: '2', title: '합격 후기 공유드립니다.', content: '상세 내용 2...', author: '행복취준생', createdAt: '2025.10.25', views: 321 },
  { id: '3', title: '면접 때 이 질문 꼭 나옵니다!', content: '상세 내용 3...', author: '김멘토', createdAt: '2025.10.26', views: 88 },
];

// 이 컴포넌트는 Next.js로부터 URL 경로의 동적 매개변수(params)를 받습니다.
export default function PostDetailPage({ params }) {
  const postId = params.id; // URL의 [id] 값 (예: '1', '2', '3')
  
  // 1. 데이터 가져오기 (실제로는 서버 API 호출로 대체)
  const post = TEMP_POSTS.find(p => p.id === postId);

  // 2. 게시글이 없을 경우 처리
  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography variant="h5" color="error" align="center">
          게시글을 찾을 수 없습니다. (ID: {postId})
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link href="/community" passHref>
            <Button variant="outlined">목록으로 돌아가기</Button>
          </Link>
        </Box>
      </Container>
    );
  }

  // 3. 게시글이 있을 경우 내용을 표시
  // 💡 수정/삭제 테스트를 위해 isAuthor를 무조건 true로 설정했습니다.
  const isAuthor = true; // post.author === '행복취준생'; (원래 권한 검사 로직)

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={1} sx={{ p: 4 }}>
        {/* 제목 */}
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          {post.title}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {/* 메타 정보 (작성자, 날짜, 조회수) */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', fontSize: '0.9rem' }}>
          <Box>
            <Typography component="span" sx={{ mr: 2 }}>작성자: **{post.author}**</Typography>
            <Typography component="span">조회수: {post.views}</Typography>
          </Box>
          <Typography component="span">{post.createdAt}</Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />

        {/* 내용 */}
        <Box sx={{ minHeight: 300, py: 3, lineHeight: 1.8 }}>
          <Typography variant="body1" whiteSpace="pre-wrap">
            {post.content}
          </Typography>
        </Box>

      </Paper>

      {/* 액션 버튼 컴포넌트 */}
      <PostActions postId={postId} isAuthor={isAuthor} />

      {/* 댓글 영역 (다음 단계에서 추가) */}
    </Container>
  );
}
