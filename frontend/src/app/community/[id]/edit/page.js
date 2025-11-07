'use client'

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, TextField, Box } from '@mui/material';
import axios from 'axios';

const S3_BASE_URL = 'https://hirepicker-storage.s3.ap-northeast-2.amazonaws.com';

// ------- PostForm 컴포넌트 (이미지/첨부파일 파일명 + 삭제 버튼/미리보기) -------
function PostForm({ initialData, isEdit, onSubmit }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [imgName, setImgName] = useState(initialData?.imgName || null);
  const [fileName, setFileName] = useState(initialData?.fileName || null);
  const [previewImgUrl, setPreviewImgUrl] = useState(imgName ? `${S3_BASE_URL}/${imgName}` : null);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setContent(initialData?.content || '');
    setImgName(initialData?.imgName || null);
    setFileName(initialData?.fileName || null);
    setPreviewImgUrl(initialData?.imgName ? `${S3_BASE_URL}/${initialData.imgName}` : null);
  }, [initialData]);

  // 이미지 변경/삭제
  const handleImgChange = e => {
    if (e.target.files[0]) {
      setSelectedImg(e.target.files[0]);
      setPreviewImgUrl(URL.createObjectURL(e.target.files[0]));
      setImgName(null); // 기존 이미지 숨기기
    }
  };
  const handleImgDelete = () => {
    setSelectedImg(null);
    setImgName(null);
    setPreviewImgUrl(null);
  };

  // 첨부파일 변경/삭제
  const handleFileChange = e => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(null); // 기존 파일 숨기기
    }
  };
  const handleFileDelete = () => {
    setSelectedFile(null);
    setFileName(null);
  };

  // 수정 저장
  const handleSubmit = e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (selectedImg) formData.append('image', selectedImg);
    if (selectedFile) formData.append('attachment', selectedFile);
    formData.append('deleteImg', imgName ? '' : '1');
    formData.append('deleteFile', fileName ? '' : '1');
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <TextField
        fullWidth
        value={title}
        onChange={e => setTitle(e.target.value)}
        label="제목"
        variant="outlined"
        sx={{ mb: 2, fontSize: 20 }}
        required
      />
      <TextField
        fullWidth
        value={content}
        onChange={e => setContent(e.target.value)}
        label="내용"
        variant="outlined"
        multiline
        rows={10}
        sx={{ mb: 2 }}
        required
      />

      {/* 이미지 파일명/삭제/미리보기 */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          color="primary"
          sx={{ mr: 2 }}
        >
          이미지 선택
          <input type="file" accept="image/*" hidden onChange={handleImgChange} />
        </Button>
        {/* 기존 이미지 파일명 + 삭제 (새 이미지 선택 전) */}
        {imgName && !selectedImg && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#198754" }}>
              기존 이미지: {imgName.split('/').pop()}
            </span>
            <Button
              type="button"
              color="error"
              sx={{ ml: 2, fontWeight: "bold" }}
              onClick={handleImgDelete}
            >
              이미지 삭제
            </Button>
          </Box>
        )}
        {/* 새 이미지 파일명 + 삭제 */}
        {selectedImg && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#198754" }}>
              선택한 이미지: {selectedImg.name}
            </span>
            <Button
              type="button"
              color="error"
              sx={{ ml: 2, fontWeight: "bold" }}
              onClick={handleImgDelete}
            >
              선택이미지 취소
            </Button>
          </Box>
        )}
        {/* 미리보기 */}
        {previewImgUrl && (
          <Box sx={{ mt: 2 }}>
            <img src={previewImgUrl} alt="첨부 이미지" style={{ maxWidth: 240, borderRadius: 6 }} />
          </Box>
        )}
      </Box>

      {/* 첨부파일 파일명/삭제/다운로드/취소 */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          color="primary"
          sx={{ mr: 2 }}
        >
          첨부파일 선택
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {fileName && !selectedFile && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <a href={`${S3_BASE_URL}/${fileName}`} download target="_blank" style={{ fontSize: 14, color: "#1a56c5" }}>
              기존 첨부파일 다운로드 ({fileName.split('/').pop()})
            </a>
            <Button
              type="button"
              color="error"
              sx={{ ml: 2, fontWeight: "bold" }}
              onClick={handleFileDelete}
            >
              첨부파일 삭제
            </Button>
          </Box>
        )}
        {selectedFile && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#1a56c5" }}>
              선택한 파일: {selectedFile.name}
            </span>
            <Button
              type="button"
              color="error"
              sx={{ ml: 2, fontWeight: "bold" }}
              onClick={handleFileDelete}
            >
              선택파일 취소
            </Button>
          </Box>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2, px: 3, py: 1, fontWeight: "bold" }}
      >
        {isEdit ? "수정 완료" : "등록"}
      </Button>
    </Box>
  );
}

// ------- 게시글 수정 페이지 -------
export default function EditPostPage() {
  const params = useParams();
  const postId = params.id;
  const router = useRouter();
  const [postToEdit, setPostToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    axios.get(`/api/posts/${postId}`, { withCredentials: true })
      .then(res => {
        if (res.data.msg === 'success' && res.data.data) {
          setPostToEdit(res.data.data);
        } else {
          setErrorMsg('수정할 게시글을 찾을 수 없습니다.');
        }
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('서버 통신 오류');
        setLoading(false);
      });
  }, [postId]);

  const handleEditSubmit = async (formData) => {
    try {
      await axios.put(`/api/posts/${postId}/edit`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push(`/community/${postId}`);
    } catch (error) {
      setErrorMsg('수정 실패: ' + (error.response?.data?.msg || error.message));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography variant="h6" align="center">로딩중...</Typography>
      </Container>
    );
  }
  if (errorMsg || !postToEdit) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography variant="h5" color="error" align="center">
          {errorMsg} (ID: {String(postId)})
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <PostForm
        isEdit={true}
        initialData={postToEdit}
        onSubmit={handleEditSubmit}
      />
    </Container>
  );
}
