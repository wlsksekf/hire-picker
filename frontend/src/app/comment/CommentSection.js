import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentForm from "./CommentForm";
import { Box, Typography } from "@mui/material";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);

  const fetchComments = () => {
    axios.get(`/api/comments?post_idx=${postId}`)
      .then(res => setComments(res.data));
  };

  useEffect(() => { if (postId) fetchComments(); }, [postId]);

  const handleAddComment = (content) => {
    axios.post("/api/comments", { post_idx: postId, content })
      .then(() => fetchComments());
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>댓글</Typography>
      <CommentForm onSubmit={handleAddComment} />
      <div style={{ marginTop: 18 }}>
        {comments.length === 0 && <div>댓글이 없습니다.</div>}
        {comments.map(c => (
          <div key={c.commentIdx} style={{ marginBottom: 12 }}>
            <b>{c.nickname || c.pUserIdx}</b>: {c.content}
            <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>{c.created_at}</span>
          </div>
        ))}
      </div>
    </Box>
  );
}
