'use client'; 

import React from 'react';
import { Box, Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deletePost } from '@/lib/actions';
export default function PostActions({ postId, isAuthor }) {
    const router = useRouter();

    const handleDelete = async() => {
        // 여기에 실제 삭제 API 호출 로직을 구현합니다.
        const confirmDelete = window.confirm('정말로 게시글을 삭제하시겠습니까?');
        if (confirmDelete) {
            //삭제 로직: 서버 액션 호출//
            const success = await deletePost(postId); // 서버 액션 호출
            if(success){
                alert('게시글이 삭제되었습니다.');
                router.push('/community'); //삭제 후 목록으로 이동
            }else {
                alert('삭제 실패.');
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            
            {/* 1. 작성자 전용 버튼 (isAuthor가 true일 때만 표시) */}
            {isAuthor && (
              <>
                <Link href={`/community/${postId}/edit`} passHref>
                  <Button variant="outlined" color="secondary">수정</Button>
                </Link>
                <Button variant="outlined" color="error" onClick={handleDelete}>
                    삭제
                </Button>
              </>
            )}
            
            {/* 2. 목록 버튼 (항상 표시되어야 하므로 조건 밖으로 이동) */}
            <Link href="/community" passHref>
              <Button variant="contained">목록</Button>
            </Link>
            
        </Box>
    );
}
