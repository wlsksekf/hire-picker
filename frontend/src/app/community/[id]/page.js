'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Container, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import CommentForm from '@/app/comment/CommentForm';
import CommentSection from '@/app/comment/CommentSection';

const S3_BASE_URL = 'https://hirepicker-storage.s3.ap-northeast-2.amazonaws.com';

const REPORT_REASONS = [
  '부적절한 내용',
  '욕설/비방',
  '광고/스팸',
  '도배',
  '기타'
];

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

  // 신고 모달 상태
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [etcInput, setEtcInput] = useState('');
  const [reportStatus, setReportStatus] = useState('');

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

  const isOwner = String(currentUserType).toLowerCase() === "personal" && currentUserIdx && post && String(currentUserIdx) === String(post.puserIdx);

  // 신고 버튼 클릭 시 모달 열기(로그인 체크)
  const openReportModal = () => {
    if (!currentUserIdx) {
      alert("로그인 후 신고할 수 있습니다.");
      router.push('/login');
      return;
    }
    setReportOpen(true);
    setReportStatus('');
    setEtcInput('');
    setReportReason(REPORT_REASONS[0]);
  };

  // 신고 전송
  const handleReport = async () => {
    // 기타: etcInput필수, 신고사유는 reason에 합쳐 전송
    if (reportReason === '기타' && !etcInput.trim()) {
      setReportStatus('기타 신고 사유를 작성해주세요.');
      return;
    }
    const reasonToSend =
      reportReason === '기타' ? `기타 - ${etcInput}` : reportReason;
    try {
      await axios.post('/api/report', {
        targetIdx: post.postIdx-1,
        reason: reasonToSend,
        reportDate: new Date().toISOString()
      }, {withCredentials:true});
      setReportStatus('신고가 접수되었습니다.');
      setTimeout(() => setReportOpen(false), 1000);
    } catch (e) {
      setReportStatus('신고 처리 중 오류가 발생했습니다.');
    }
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
          <Box sx={{ display: "flex", gap: 1 }}>
            {isOwner && (
              <>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleEdit}
                  sx={{ mr: 1 }}
                >
                  수정
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  sx={{ mr: 1 }}
                >
                  삭제
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              color="error"
              sx={{ fontWeight: 'bold', px: 3, py: 1, borderRadius: 2 }}
              onClick={openReportModal}
            >
              신고하기
            </Button>
          </Box>
        </Box>

        {/* 신고 모달 (기타 입력 → reason 하나로 합침) */}
        <Dialog open={reportOpen} onClose={() => setReportOpen(false)}>
          <DialogTitle>신고하기</DialogTitle>
          <DialogContent>
            <RadioGroup
              value={reportReason}
              onChange={e => { setReportReason(e.target.value); if(e.target.value !== '기타') setEtcInput(''); }}
            >
              {REPORT_REASONS.map(r => (
                <FormControlLabel key={r} value={r} control={<Radio />} label={r} />
              ))}
            </RadioGroup>
            {reportReason === '기타' && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ mb: 1, fontWeight: 'bold' }}>신고 사유를 직접 입력:</Typography>
                <textarea
                  style={{ width: '100%', minHeight: '56px', resize: 'vertical' }}
                  value={etcInput}
                  onChange={e => setEtcInput(e.target.value)}
                  placeholder="신고 사유를 작성해주세요."
                />
              </Box>
            )}
            {reportStatus && (
              <Box sx={{ color: "#e60000", mt: 2, fontWeight: "bold" }}>{reportStatus}</Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportOpen(false)}>닫기</Button>
            <Button variant="contained" color="error" onClick={handleReport}>
              신고
            </Button>
          </DialogActions>
        </Dialog>

        {errorMsg && (
          <Box sx={{
            mt: 2, p: 2, backgroundColor: '#ffe6e6', color: '#cc0000',
            border: '1px solid #ffb3b3', borderRadius: 1, textAlign: 'center'
          }}>
            {errorMsg}
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <CommentSection postId={postIdx} currentUserIdx={currentUserIdx} />
        </Box>
      </Box>
    </Container>
  );
}
