import React, { useState } from "react";
import { TextField, Button } from "@mui/material";

export default function CommentForm({ onSubmit }) {
  const [content, setContent] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
      <TextField
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="댓글을 입력하세요"
        size="small"
        fullWidth
        sx={{ background: "#fff" }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!content.trim()}
        sx={{ px: 2 }}
      >
        등록
      </Button>
    </form>
  );
}
