'use client'
// app/community/[id]/edit/page.js
import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const S3_BASE_URL = 'https://hirepicker-storage.s3.ap-northeast-2.amazonaws.com';

// ---- PostForm 컴포넌트 ----
function PostForm({ initialData, isEdit, onSubmit }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 이미지/첨부파일 상태 (기존 값, 삭제 여부)
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

  // 이미지 변경 및 삭제
  const handleImgChange = e => {
    if (e.target.files[0]) {
      setSelectedImg(e.target.files[0]);
      setPreviewImgUrl(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handleImgDelete = () => {
    setSelectedImg(null);    // 신규 업로드 초기화
    setImgName(null);        // 기존 DB/S3 이미지 제거 플래그
    setPreviewImgUrl(null);
  };

  // 첨부파일 변경 및 삭제
  const handleFileChange = e => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const handleFileDelete = () => {
    setSelectedFile(null);  // 신규 업로드 초기화
    setFileName(null);      // 기존 DB/S3 첨부파일 제거 플래그
  };

  // 수정 저장
  const handleSubmit = e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // FormData 생성(첨부/이미지 삭제 여부도 함께)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    // 새 파일/이미지 업로드 요청 포함
    if (selectedImg) formData.append('image', selectedImg);
    if (selectedFile) formData.append('attachment', selectedFile);
    // 삭제 플래그 전달(백엔드에서 null/""이면 기존 파일 삭제)
    formData.append('deleteImg', imgName ? '' : '1');
    formData.append('deleteFile', fileName ? '' : '1');

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" style={{ width: '100%', fontSize: 20, marginBottom: 8}} />
      </div>
      <div>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} style={{ width: '100%', marginBottom: 8}} />
      </div>
      {/* ---- 이미지 미리보기 및 삭제 ---- */}
      <div>
        <label>이미지: 
          <input type="file" accept="image/*" onChange={handleImgChange} />
        </label>
        {previewImgUrl && (
          <div style={{ marginTop: 12 }}>
            <img src={previewImgUrl} alt="첨부 이미지" style={{ maxWidth: 240, borderRadius: 6 }} />
            <button type="button" style={{
              marginLeft: 10, color: '#e60000', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer'
            }} onClick={handleImgDelete}>
              이미지 삭제
            </button>
          </div>
        )}
      </div>
      {/* ---- 첨부파일 미리보기 및 삭제 ---- */}
      <div style={{ marginTop: 15 }}>
        <label>첨부파일: 
          <input type="file" onChange={handleFileChange} />
        </label>
        {fileName && (
          <div style={{ marginTop: 7 }}>
            <a href={`${S3_BASE_URL}/${fileName}`} download target="_blank" style={{ fontSize: 14, color: '#1a56c5' }}>
              기존 첨부파일 다운로드 ({fileName.split('/').pop()})
            </a>
            <button type="button" style={{
              marginLeft: 10, color: '#e60000', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer'
            }} onClick={handleFileDelete}>
              첨부파일 삭제
            </button>
          </div>
        )}
      </div>
      <button type="submit" style={{ marginTop: 18, padding: "10px 18px", background: "#1976d2", color: "#fff", fontWeight: "bold", border: "none", borderRadius: 5 }}>
        {isEdit ? "수정 완료" : "등록"}
      </button>
    </form>
  );
}

// ---- 수정 페이지 ----
export default function EditPostPage({ params }) {
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
          {errorMsg} (ID: {postId})
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
