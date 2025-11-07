'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const BOARD_CATEGORIES = [
  { value: '', label: '카테고리 선택' },
  { value: '1', label: '취준/이직' },
  { value: '2', label: '회사생활/커리어' },
  { value: '3', label: '자유주제' },
  { value: '4', label: '아티클' },
];

export default function PostWritePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', content: '', board_idx: '' });
  const [fileState, setFileState] = useState({
    selectedFile: null,
    previewUrl: null,
    attachmentFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const write_api_url = `/api/posts/write`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (fileState.previewUrl) URL.revokeObjectURL(fileState.previewUrl);
    if (file) {
      setFileState(fs => ({ ...fs, selectedFile: file, previewUrl: URL.createObjectURL(file) }));
      setMessage('');
    } else {
      setFileState(fs => ({ ...fs, selectedFile: null, previewUrl: null }));
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    setFileState(fs => ({ ...fs, attachmentFile: file }));
  };

  const handleRemoveFile = (showMessage = true) => {
    if (fileState.previewUrl) URL.revokeObjectURL(fileState.previewUrl);
    setFileState(fs => ({ ...fs, selectedFile: null, previewUrl: null }));
    if (showMessage) setMessage('파일 첨부가 취소되었습니다.');
  };

  const handleRemoveAttachment = (showMessage = true) => {
    setFileState(fs => ({ ...fs, attachmentFile: null }));
    if (showMessage) setMessage('파일 첨부가 취소되었습니다.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!formData.title || !formData.content || !formData.board_idx) {
      setMessage('⚠️ 제목, 내용, 그리고 카테고리를 모두 선택해주세요.');
      return;
    }
    setIsSubmitting(true);
    const postData = new FormData();
    postData.append('title', formData.title);
    postData.append('content', formData.content);
    postData.append('board_idx', formData.board_idx);
    if (fileState.selectedFile) postData.append('image', fileState.selectedFile);
    if (fileState.attachmentFile) postData.append('attachment', fileState.attachmentFile);
    try {
      const response = await axios.post(write_api_url, postData, { withCredentials: true });
      const postId = response.data?.data?.postIdx || response.data?.id || 'new';
      setMessage(`✅ 게시글 작성이 완료되었습니다. ID: ${postId}`);
      setFormData({ title: '', content: '', board_idx: '' });
      handleRemoveFile(false);
      handleRemoveAttachment(false);
      setTimeout(() => {
        router.push(`/community/${postId}`);
      }, 1000);
    } catch (error) {
      let errorMessage = '⚠️ 게시글 작성 중 서버 오류가 발생했습니다.';
      if (error.response?.status === 401) {
        errorMessage = '🚫 인증 실패! 로그인 세션이 만료되었습니다. 다시 로그인해 주세요.';
        setTimeout(() => router.push('/login'), 1500);
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleRemoveFile(false);
    handleRemoveAttachment(false);
    router.push('/community');
  };

  useEffect(() => {
    return () => {
      if (fileState.previewUrl) URL.revokeObjectURL(fileState.previewUrl);
    };
  }, [fileState.previewUrl]);

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1.1em',
    boxSizing: 'border-box',
    marginBottom: '20px'
  };
  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'none\' stroke=\'currentColor\'%3e%3cpath d=\'M6 9l4 4 4-4\'/%3e%3c/svg%3e")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.7em top 50%',
    backgroundSize: '1.2em',
    paddingRight: '2.5em',
    cursor: 'pointer'
  };

  return (
    <div style={{ width: '80%', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
      <h1 style={{ fontSize: '2.5em', borderBottom: '3px solid #007bff', paddingBottom: '15px', marginBottom: '30px', color: '#333' }}>
        새 게시글 작성
      </h1>
      <form onSubmit={handleSubmit}>
        {/* 카테고리 */}
        <div>
          <label htmlFor="board_idx" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            카테고리 선택
          </label>
          <select
            id="board_idx"
            name="board_idx"
            value={formData.board_idx}
            onChange={handleChange}
            style={selectStyle}
            disabled={isSubmitting}
          >
            {BOARD_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value} disabled={cat.value === ''}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        {/* 제목 */}
        <div>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            style={inputStyle}
            placeholder="제목을 입력해주세요."
            disabled={isSubmitting}
          />
        </div>
        {/* 내용 */}
        <div>
          <label htmlFor="content" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            내용
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="15"
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="내용을 입력해주세요."
            disabled={isSubmitting}
          />
        </div>
        {/* --- 파일 첨부 영역 (이미지/일반파일) --- */}
        <div style={{ marginBottom: "30px", border: "1px dashed #ccc", padding: "20px", borderRadius: "8px" }}>
          {/* 이미지 첨부 */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", color: "#555" }}>
              이미지 파일 첨부 (선택 사항)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-upload-input"
              disabled={isSubmitting}
            />
            <label htmlFor="file-upload-input" style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: fileState.selectedFile ? undefined : undefined,
              color: undefined,
            }}>
              <Button
                variant="contained"
                color="primary"
                component="span"
                size="small"
                disabled={isSubmitting}
              >
                {fileState.selectedFile ? "이미지 변경" : "이미지 선택"}
              </Button>
            </label>
            {/* 미리보기 */}
            {fileState.selectedFile && (
              <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "20px", backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px solid #eee" }}>
                  <div style={{ flexShrink: 0 }}>
                    <img src={fileState.previewUrl} alt="파일 미리보기" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px', wordBreak: 'break-all' }}>
                      첨부된 파일: {fileState.selectedFile.name}
                    </p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                      크기: {(fileState.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button onClick={() => handleRemoveFile(true)} color="error" variant="outlined" sx={{ marginTop: "10px" }}>
                      첨부 취소
                    </Button>
                  </div>
              </div>
            )}
          </div>
          {/* 첨부파일 (일반 파일) */}
          <div>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "bold", color: "#555" }}>
              일반 파일 첨부 (pdf/doc/zip 등, 선택 사항)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.hwp"
              onChange={handleAttachmentChange}
              id="attachment-file-input"
              style={{ display: "none" }}
              disabled={isSubmitting}
            />
            <label htmlFor="attachment-file-input" style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              <Button
                variant="contained"
                color="primary"
                component="span"
                size="small"
                disabled={isSubmitting}
              >
                {fileState.attachmentFile ? "파일 변경" : "파일 첨부"}
              </Button>
            </label>
            {fileState.attachmentFile && (
              <div style={{ marginTop: "16px", backgroundColor: "#f4fff7", padding: "12px", borderRadius: "8px", border: "1px solid #c7f5dd" }}>
                  <span>첨부된 파일: {fileState.attachmentFile.name}</span>
                  <Button type="button" onClick={() => handleRemoveAttachment(true)} color="error" variant="outlined" sx={{ marginLeft: "12px" }}>
                    첨부 취소
                  </Button>
              </div>
            )}
          </div>
        </div>
        {/* 메시지/에러 */}
        {message && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: message.startsWith('✅') ? '#e6ffe6' : '#ffe6e6',
            color: message.startsWith('✅') ? '#008000' : '#cc0000',
            border: '1px solid',
            borderColor: message.startsWith('✅') ? '#b3ffb3' : '#ffb3b3',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}
        {/* 버튼 그룹 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button
            type="button"
            onClick={handleCancel}
            variant="outlined"
            color="primary"
            disabled={isSubmitting}
            sx={{ padding: '12px 25px', fontWeight: 'bold' }}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ padding: '12px 25px', fontWeight: 'bold' }}
          >
            {isSubmitting ? '작성 중...' : '작성 완료'}
          </Button>
        </div>
      </form>
    </div>
  );
}
