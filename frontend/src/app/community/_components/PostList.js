// PostList.js: PostListItem들을 담는 컨테이너
import React from 'react';
import { Box, Typography } from '@mui/material';
import PostListItem from './PostListItem'; // 방금 만든 컴포넌트 임포트

export default function PostList({ posts }) {
  if (!posts || posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography color="text.secondary">아직 작성된 게시글이 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      {/* 테이블 헤더 */}
      <Box sx={{ display: 'flex', py: 1, px: 2, backgroundColor: 'action.selected', fontWeight: 'bold' }}>
        <Typography sx={{ flexGrow: 1 }}>제목</Typography>
        <Typography sx={{ width: '80px', textAlign: 'center' }}>작성자</Typography>
        <Typography sx={{ width: '60px', textAlign: 'center' }}>날짜</Typography>
        <Typography sx={{ width: '40px', textAlign: 'right' }}>조회</Typography>
      </Box>
      
      {/* 목록 렌더링 */}
      {posts.map((post) => (
        <PostListItem key={post.id} post={post} />
      ))}
    </Box>
  );
}