'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Container, Box, Typography } from '@mui/material';
import CommentForm from '@/app/comment/CommentForm';

const S3_BASE_URL = 'https://hirepicker-storage.s3.ap-northeast-2.amazonaws.com';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postIdString = params?.id;
  const postIdx = postIdString && !isNaN(Number(postIdString)) ? Number(postIdString) : null;
  const api_url = postIdx ? `/api/posts/${postIdx}` : null;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUserIdx, setCurrentUserIdx] = useState(null);
  const [currentUserType, setCurrentUserType] = useState(null);
  const [comments, setComments] = useState([]);

  // 로그인 사용자 정보 불러오기
  useEffect(() => {
    axios.get('/api/posts/me', { withCredentials: true })
      .then(response => {
        setCurrentUserIdx(response.data.id);
        setCurrentUserType(response.data.userType);
      })
      .catch(() => {
        setCurrentUserIdx(null);
      });
  }, []);

  // 게시글 상세정보 불러오기
  useEffect(() => {
    if (!postIdx) {
      setErrorMsg('잘못된 게시글 번호입니다.');
      setLoading(false);
      return;
    }
    axios.get(api_url, { withCredentials: true })
      .then(response => {
        if (response.data.msg === 'success' && response.data.data) {
          setPost(response.data.data);
        } else {
          setErrorMsg('게시글 또는 데이터 형식 오류입니다.');
        }
        setLoading(false);
      })
      .catch(error => {
        setErrorMsg('데이터 통신 중 심각한 오류가 발생했습니다.');
        setLoading(false);
      });
  }, [postIdx]);

  // 댓글 조회 함수
  const fetchComments = () => {
    axios.get(`/api/comments?post_idx=${postIdx}`)
      .then(res => setComments(res.data));
  };

  useEffect(() => { if (postIdx) fetchComments(); }, [postIdx]);

  // 댓글 작성 함수 (content 유효성 체크, null 방지)
  const handleAddComment = (content) => {
    if (!content || content.trim().length === 0) {
      alert("댓글 내용을 입력하세요!");
      return;
    }
    if (!currentUserIdx) {
      alert("로그인이 필요합니다.");
      return;
    }
    axios.post("/api/comments", {
      postIdx: postIdx,
      pUserIdx: currentUserIdx,
      content
    }).then(() => fetchComments());
  };

  // 기타 버튼 핸들러 생략...

  if (loading) {
    return <Box sx={{ p: 6, textAlign: 'center', fontSize: '1.2em' }}>로딩 중...</Box>;
  }
  if (errorMsg && !post) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Box sx={{
          p: 4, textAlign: 'center', color: '#e60000', border: '1px solid #ffcccc',
          backgroundColor: '#fffafa', borderRadius: 2, m: '40px auto'
        }}>
          <Box sx={{ mb: 2, fontWeight: 'bold' }}>{errorMsg}</Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push('/community')}
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }
  if (!post) {
    return <Box sx={{ p: 3, textAlign: 'center' }}>게시글이 존재하지 않습니다.</Box>;
  }

  const imgUrl = post?.imgName ? `${S3_BASE_URL}/${post.imgName}` : null;
  const fileUrl = post?.fileName ? `${S3_BASE_URL}/${post.fileName}` : null;
  const isOwner = String(currentUserType).toLowerCase() === "personal" && currentUserIdx && post && String(currentUserIdx) === String(post.puserIdx);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8, p: 3 }}>
      <Box sx={{
        width: '100%', p: 3, border: '1px solid #ccc', borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* 게시글 헤더/정보 영역 */}
        <Box component="h1" sx={{
          fontSize: '2.2em', borderBottom: '2px solid #333', pb: 1, mb: 2
        }}>{post.title}</Box>
        <Box sx={{
          fontSize: '0.9em', color: '#666', mb: 4,
          borderBottom: '1px dashed #eee', pb: 1
        }}>
          번호: {post.postIdx} | 작성자: {post.nickname} | 등록일: {post.createdAt} | 조회수: {post.viewCount}
        </Box>
        <Box sx={{
          minHeight: '200px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.1em', py: 1
        }}>{post.content}</Box>

        {/* 이미지, 파일 영역 생략 ... */}

        {/* ===== 댓글 영역 ===== */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>댓글</Typography>
          <CommentForm onSubmit={handleAddComment} />
          <div style={{ marginTop: 18 }}>
            {comments.length === 0 && <div>댓글이 없습니다.</div>}
            {comments.map(c => (
              <div key={c.commentIdx} style={{ marginBottom: 12 }}>
                <b>{c.nickname}</b>: {c.content}
                <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>{c.createdAt}</span>
              </div>
            ))}
          </div>
        </Box>
      </Box>
    </Container>
  );
}
