import React, { useState } from "react";
import { TextField, Button } from "@mui/material";

export default function CommentForm({ onSubmit }) {
  const [content, setContent] = useState("");
  const handleSubmit = e => {
    e.preventDefault();
    console.log(content)
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
      <TextField
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="댓글을 입력하세요"
        size="small"
        fullWidth
      />
      <Button type="submit" variant="contained" disabled={!content.trim()}>
        등록
      </Button>
    </form>
  );
}
