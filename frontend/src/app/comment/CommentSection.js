import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentForm from "./CommentForm";
import { Box, Button, TextField } from "@mui/material";

export default function CommentSection({ postId, currentUserIdx }) {
  const [comments, setComments] = useState([]);
  const [editIdx, setEditIdx] = useState(null);       // 수정중인 댓글 ID
  const [editContent, setEditContent] = useState(""); // 수정중인 댓글 내용

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
      pUserIdx: currentUserIdx, postIdx: postId, content
    }).then(() => fetchComments());
  };

  // 댓글 삭제
  const handleDeleteComment = (cmt) => {
    if (window.confirm("정말 삭제할까요?"))
      axios.delete(`/api/comments/${cmt.commentIdx}`)
        .then(() => fetchComments());
  };

  // 댓글 수정모드 진입
  const handleEditComment = (cmt) => {
    setEditIdx(cmt.commentIdx);
    setEditContent(cmt.content);
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditIdx(null);
    setEditContent("");
  };

  // 댓글 수정 저장
  const handleSubmitEdit = (commentIdx) => {
    if (!editContent.trim()) {
      alert("수정할 내용을 입력하세요.");
      return;
    }
    axios.put(`/api/comments/${commentIdx}`, {
      content: editContent
    }).then(() => {
      setEditIdx(null);
      setEditContent("");
      fetchComments();
    });
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
                {editIdx === c.commentIdx ? (
                  <TextField
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    multiline
                    fullWidth
                    size="small"
                  />
                ) : (
                  c.content
                )}
              </Box>
              <Box sx={{ fontSize: "0.8em", color: "#aaa", mb: 1 }}>
                작성일: {c.createdAt}
              </Box>
              {String(currentUserIdx) === String(c.puserIdx) && (
                <Box sx={{ mt: 1 }}>
                  {editIdx === c.commentIdx ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ mr: 1 }}
                        onClick={() => handleSubmitEdit(c.commentIdx)}
                      >
                        저장
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={handleCancelEdit}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </div>
      )}
    </div>
  );
}
