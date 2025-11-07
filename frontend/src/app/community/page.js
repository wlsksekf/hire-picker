'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import PostList from "./_components/PostList";

// 카테고리 목록 (백엔드 boardIdx와 값 반드시 일치)
const BOARD_CATEGORIES = [
  { value: '', label: '전체' },
  { value: '1', label: '취준/이직' },
  { value: '2', label: '회사생활/커리어' },
  { value: '3', label: '자유주제' },
  { value: '4', label: '아티클' },
];

export default function Page() {
  const [boardIdx, setBoardIdx] = useState(''); // 선택된 카테고리 ID
  const [list, setList] = useState([]);          // 게시글 리스트
  const [cPage, setcPage] = useState(1);         // 현재 페이지
  const [totalPage, setTotalPage] = useState(0); // 전체 페이지 수
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [loading, setLoading] = useState(true);        // 로딩 상태
  const [currentUserType, setCurrentUserType] = useState(null);

  // 게시글 데이터 불러오기 함수
function callData() {
  if (boardIdx === '') {
    // 전체 글 조회
    axios.get("/api/posts", {
      params: { cPage: cPage },
      withCredentials: true
    })
    .then(response => {
      const data = response.data.data;
      setList(data.list || []);
      setTotalPage(data.totalPages || 0);
      setcPage(data.cPage || 1);
    })
    .catch(error => {
      setList([]);
      setTotalPage(0);
    });
  } else {
    // 카테고리별 글 조회
    axios.get("/api/posts/category", {
      params: { boardIdx: boardIdx, cPage: cPage },
      withCredentials: true
    })
    .then(response => {
      const data = response.data.data;
      setList(data.list || []);
      setTotalPage(data.totalPages || 0);
      setcPage(data.cPage || 1);
    })
    .catch(error => {
      setList([]);
      setTotalPage(0);
    });
  }
}

  // 로그인 상태 및 유저타입 불러오기
  useEffect(() => {
    axios.get('/api/posts/me', { withCredentials: true })
      .then(response => {
        setIsLoggedIn(response.data.authenticated === true);
        setCurrentUserType(response.data.userType);
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  // 카테고리 or 페이지 변경시 게시글 데이터 갱신
  useEffect(() => {
    callData();
  }, [boardIdx, cPage]);

  // 페이지 변경 함수 (페이징 컴포넌트용)
  function changePage(e, p) {
    setcPage(p);
  }

  return (
    <div style={{ width: "90%", margin: "auto", padding: "20px" }}>
      <PostList
        ar={list}
        tp={totalPage}
        cp={changePage}
        isLoggedIn={isLoggedIn}
        loading={loading}
        currentUserType={currentUserType}
        boardIdx={boardIdx}
        setBoardIdx={setBoardIdx}
        BOARD_CATEGORIES={BOARD_CATEGORIES}
      />
    </div>
  );
}
