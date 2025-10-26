// page.js: 게시글 목록 페이지 (라우트)
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
// _components 폴더에서 PostList 컴포넌트를 임포트합니다.
import PostList from './_components/PostList'; 

// [Next.js App Router의 핵심] 
// 이 페이지 컴포넌트는 기본적으로 서버 컴포넌트(Server Component)입니다.
// 따라서 여기서 데이터 패칭(API 호출)을 진행하는 것이 권장됩니다.

// 임시 데이터 (실제로는 API 호출 로직으로 대체)
const TEMP_POSTS = [
  { id: 1, title: '[공지] 커뮤니티 이용 수칙을 확인하세요.', author: '관리자', createdAt: '2025.10.01', views: 550 },
  { id: 2, title: '합격 후기 공유드립니다. (Feat. 삼성전자)', author: '행복취준생', createdAt: '2025.10.25', views: 321 },
  { id: 3, title: '면접 때 이 질문 꼭 나옵니다!', author: '김멘토', createdAt: '2025.10.26', views: 88 },
];

// async function getPosts() {
//   // 실제 API 호출: const res = await fetch('YOUR_API_ENDPOINT');
//   // return res.json();
//   return TEMP_POSTS; 
// }

export default function CommunityPage() {
  // const posts = await getPosts(); // 실제 사용 시
  const posts = TEMP_POSTS; 

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          커뮤니티 게시판
        </Typography>
        <Link href="/community/new" passHref style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary">
            새 글 작성
          </Button>
        </Link>
      </Box>
      
      {/* PostList 컴포넌트에 데이터를 전달하여 렌더링 */}
      <PostList posts={posts} />
      
      {/* Pagination 컴포넌트가 여기에 배치됩니다. (다음 순서) */}
    </Container>
  );
}