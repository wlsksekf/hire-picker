import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentForm from "./CommentForm";
import { Box, Typography, Button } from "@mui/material";

export default function CommentSection({ postId, currentUserIdx }) {
  const [comments, setComments] = useState([]);

  // 댓글 목록 불러오기
  const fetchComments = () => {
    axios.get(`/api/comments?post_idx=${postId}`)
      .then(res => setComments(res.data));
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  // 댓글 추가
  const handleAddComment = (content) => {
    if (!currentUserIdx) {
      alert("로그인 후 이용가능 합니다.");
      return;
    }
    axios.post("/api/comments", {
      puserIdx: currentUserIdx, postIdx: postId, content
    }).then(() => fetchComments());
  };

  // 댓글 수정/삭제 핸들러 (구현 필요)
  const handleEditComment = (cmt) => {
    // Edit modal or textarea 띄우기 구현
    alert(`(예시) 댓글 수정: ${cmt.commentIdx}`);
  };
  const handleDeleteComment = (cmt) => {
    if (window.confirm("정말 삭제할까요?"))
      axios.delete(`/api/comments/${cmt.commentIdx}`)
        .then(() => fetchComments());
  };

  return (
    <div>
      <CommentForm onSubmit={handleAddComment} />
      {comments.length === 0 ? (
        <div style={{ marginTop: "18px", color: "#888" }}>댓글이 없습니다.</div>
      ) : (
        <div style={{ marginTop: "18px" }}>
          {comments.map(c => (
            <Box key={c.commentIdx}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2, p: 2, mb: 2,
                background: "#fafcff"
              }}
            >
              <Box sx={{ fontWeight: "bold" }}>{c.nickname}</Box>
              <Box sx={{ color: "#389", fontSize: "0.9em", mb: 1 }}>
                {c.content}
              </Box>
              <Box sx={{ fontSize: "0.8em", color: "#aaa", mb: 1 }}>
                작성일: {c.createdAt}
              </Box>
              {/* 본인 댓글일 때만 Edit/Delete 버튼 노출 */}
              {String(currentUserIdx) === String(c.puserIdx) && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    sx={{ mr: 1 }}
                    onClick={() => handleEditComment(c)}
                  >
                    수정
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteComment(c)}
                  >
                    삭제
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </div>
      )}
    </div>
  );
}
