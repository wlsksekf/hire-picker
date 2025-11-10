'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Container, Box } from '@mui/material';

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

  const imgUrl = post?.imgName ? `${S3_BASE_URL}/${post.imgName}` : null;
  const fileUrl = post?.fileName ? `${S3_BASE_URL}/${post.fileName}` : null;

  const handleEdit = () => {
    if (postIdx) router.push(`/community/${postIdx}/edit`);
  };
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제할까요?')) return;
    try {
      await axios.delete(`/api/posts/${postIdx}`, { withCredentials: true });
      alert('삭제가 완료되었습니다.');
      router.push('/community');
    } catch (e) {
      setErrorMsg('삭제 실패:' + (e.response?.data?.msg || e.message));
    }
  };
  const handleList = () => {
    router.push('/community');
  };

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
            onClick={handleList}
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

  const isOwner = String(currentUserType).toLowerCase() === "personal" && currentUserIdx && post && String(currentUserIdx) === String(post.puserIdx);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8, p: 3 }}>
      <Box sx={{
        width: '100%', p: 3, border: '1px solid #ccc', borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
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

        {/* 이미지 미리보기 + 파일명 */}
        {imgUrl && (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <img src={imgUrl} alt="첨부 이미지" style={{
              maxWidth: '300px', borderRadius: '8px', boxShadow: '0 0 12px #ddd'
            }} />
            <Box sx={{ fontSize: '0.9em', color: '#666', mt: 1 }}>첨부 이미지</Box>
            <Box sx={{ fontSize: '0.95em', color: '#198754', mt: 1 }}>
              {post.imgName && post.imgName.split('/').pop()}
            </Box>
          </Box>
        )}

        {/* 첨부파일 다운로드 MUI 버튼 */}
        {fileUrl && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="success"
              component="a"
              href={fileUrl}
              download
              target="_blank"
              sx={{ px: 2, py: 1, fontWeight: 'bold', borderRadius: 1, mt: 1, textTransform: 'none' }}
            >
              첨부파일 다운로드
            </Button>
            <Box sx={{ fontSize: '0.9em', color: '#666', mt: 1 }}>
              {post.fileName && post.fileName.split('/').pop()}
            </Box>
          </Box>
        )}

        <hr style={{ borderColor: '#f0f0f0', marginTop: '40px', marginBottom: '20px' }} />

        {/* 목록/수정/삭제 MUI 버튼 100% theme 적용 */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleList}
          >
            목록
          </Button>
          {isOwner && (
            <Box>
              <Button
                variant="contained"
                color="info"
                onClick={handleEdit}
                sx={{ mr: 2 }}
              >
                수정
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
              >
                삭제
              </Button>
            </Box>
          )}
        </Box>

        {errorMsg && (
          <Box sx={{
            mt: 2, p: 2, backgroundColor: '#ffe6e6', color: '#cc0000',
            border: '1px solid #ffb3b3', borderRadius: 1, textAlign: 'center'
          }}>
            {errorMsg}
          </Box>
        )}
      </Box>
    </Container>
  );
}
