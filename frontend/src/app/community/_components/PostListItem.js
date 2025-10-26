// PostListItem.js: 목록의 한 줄
import React from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';

export default function PostListItem({ post }) {
  // PostList에서 post 데이터를 props로 전달받습니다.
  const { id, title, author, createdAt, views } = post;
  
  return (
    <Link href={`/community/${id}`} passHref style={{ textDecoration: 'none' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          py: 1.5, 
          px: 2, 
          borderBottom: '1px solid #f0f0f0', 
          '&:hover': { backgroundColor: 'action.hover' },
          color: 'text.primary', // Link가 색상을 상속받도록 설정
        }}
      >
        <Typography sx={{ flexGrow: 1, fontWeight: 'medium' }}>{title}</Typography>
        <Typography sx={{ width: '80px', textAlign: 'center' }}>{author}</Typography>
        <Typography sx={{ width: '60px', textAlign: 'center' }}>{createdAt}</Typography>
        <Typography sx={{ width: '40px', textAlign: 'right' }}>{views}</Typography>
      </Box>
    </Link>
  );
}