'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const S3_BASE_URL = 'https://hirepicker-storage.s3.ap-northeast-2.amazonaws.com';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postIdString = params?.id;
  const postIdx = postIdString && !isNaN(Number(postIdString)) ? Number(postIdString) : null;
  const api_url = postIdx ? `/api/posts/${postIdx}` : null;

  // --- 컴포넌트 상태 선언 ---
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUserIdx, setCurrentUserIdx] = useState(null);

  useEffect(() => {
    axios.get('/api/posts/me', { withCredentials: true })
      .then(response => {
        setCurrentUserIdx(response.data.id);
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
    axios.get(api_url)
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

  const buttonStyle = {
    padding: '10px 15px',
    margin: '0 5px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s, transform 0.1s',
    minWidth: '80px',
  };

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
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2em' }}>로딩 중...</div>;
  }
  if (errorMsg && !post) {
    return (
      <div style={{
        padding: '40px', textAlign: 'center', color: '#e60000', border: '1px solid #ffcccc', backgroundColor: '#fffafa', borderRadius: '8px', margin: '40px auto', width: '80%'
      }}>
        <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>{errorMsg}</p>
        <button
          onClick={handleList}
          style={{ ...buttonStyle, backgroundColor: '#f0f0f0', borderColor: '#ccc' }}
        >목록으로 돌아가기</button>
      </div>
    );
  }
  if (!post) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>게시글이 존재하지 않습니다.</div>;
  }

  const isOwner = currentUserIdx && post && String(currentUserIdx) === String(post.puserIdx);

  return (
    <div style={{
      width: '80%',
      margin: '40px auto',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {/* 제목/기본정보 */}
      <h1 style={{
        fontSize: '2.2em',
        borderBottom: '2px solid #333',
        paddingBottom: '10px',
        marginBottom: '15px'
      }}>{post.title}</h1>
      <p style={{
        fontSize: '0.9em',
        color: '#666',
        marginBottom: '30px',
        borderBottom: '1px dashed #eee',
        paddingBottom: '10px'
      }}>
        번호: {post.postIdx} | 작성자: {post.nickname} | 등록일: {post.createdAt} | 조회수: {post.viewCount}
      </p>

      {/* 본문내용 */}
      <div style={{
        minHeight: '200px',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
        fontSize: '1.1em',
        padding: '10px 0'
      }}>
        {post.content}
      </div>

      {/* 이미지/파일 */}
      {imgUrl && (
        <div style={{ margin: '30px 0 10px 0', textAlign: 'center' }}>
          <img src={imgUrl} alt="첨부 이미지" style={{
            maxWidth: '300px',
            borderRadius: '8px',
            boxShadow: '0 0 12px #ddd'
          }} />
          <div style={{ fontSize: '0.9em', color: '#666' }}>첨부 이미지</div>
        </div>
      )}
      {fileUrl && (
        <div style={{ margin: '10px 0 0 0', textAlign: 'center' }}>
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 16px',
              backgroundColor: '#198754',
              color: 'white',
              borderRadius: '6px',
              fontWeight: 'bold',
              textDecoration: 'none',
              border: '1px solid #198754',
              marginTop: '10px'
            }}
          >첨부파일 다운로드</a>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '4px' }}>
            {post.fileName && post.fileName.split('/').pop()}
          </div>
        </div>
      )}

      <hr style={{ borderColor: '#f0f0f0', marginTop: '40px', marginBottom: '20px' }} />

      {/* 버튼: 목록, (내 글일 때만) 수정/삭제 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <button
            onClick={handleList}
            style={{ ...buttonStyle, backgroundColor: '#f0f0f0', color: '#333', borderColor: '#ccc' }}
          >목록</button>
        </div>
        {isOwner && (
          <div>
            <button
              onClick={handleEdit}
              style={{ ...buttonStyle, backgroundColor: '#5bc0de', color: 'white', borderColor: '#46b8da' }}
            >수정</button>
            <button
              onClick={handleDelete}
              style={{ ...buttonStyle, backgroundColor: '#d9534f', color: 'white', borderColor: '#d43f3a' }}
            >삭제</button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
          border: '1px solid #ffb3b3',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}
