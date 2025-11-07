"use client";

import React, { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";

// 한국어 주석: 손상된 기존 페이지를 임시 복구하여 런타임 오류를 방지합니다.
export default function AiResumePage() {
  // 한국어 주석: 인증 스토어에서 사용자 이름만 사용
  const { user } = useAuthStore((state) => state);

  // 한국어 주석: 최소 필드 상태 (제목/이름)
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");

  // 한국어 주석: 사용자 기본값 주입
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: 16 }}>
      {/* 한국어 주석: 최소 UI - 제목/이름 입력만 제공 */}
      <h1 style={{ marginBottom: 16 }}>이력서 작성</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>이력서 제목</div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 신입 프론트엔드 개발자 이력서"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>이름</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <div style={{ color: "#666", marginTop: 8 }}>
          하위 컴포넌트(`frontend/src/components/ResumeForm.jsx`)가 손상되어 임시 입력만 제공됩니다.
          원하시면 해당 파일 복구도 진행하겠습니다.
        </div>
      </div>
    </div>
  );
}

