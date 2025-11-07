'use client';

import React, { useEffect, useState, useCallback } from "react";
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
  const [list, setList] = useState([]);         // 게시글 리스트
  const [cPage, setcPage] = useState(1);        // 현재 페이지
  const [totalPage, setTotalPage] = useState(0);// 전체 페이지 수
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [loading, setLoading] = useState(true);        // 로딩 상태
  const [currentUserType, setCurrentUserType] = useState(null);

  // 실검색 상태(for API 요청)
  const [appliedSearchType, setAppliedSearchType] = useState('title');
  const [appliedSearchText, setAppliedSearchText] = useState('');
  // 입력란 제어 상태(실시간 입력/타이핑)
  const [searchType, setSearchType] = useState('title');
  const [searchText, setSearchText] = useState('');

  // 게시글 데이터 불러오기 함수, useCallback으로 memoization
  const callData = useCallback(() => {
    setLoading(true);

    const params = { cPage };
    if (boardIdx !== '') params.boardIdx = boardIdx;
    if (appliedSearchText.trim() !== '') {
      params.type = appliedSearchType;
      params.query = appliedSearchText;
    }

    let url = "/api/posts";
    if (boardIdx !== '') url = "/api/posts/category";

    axios.get(url, {
      params,
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
      })
      .finally(() => setLoading(false));
  }, [boardIdx, cPage, appliedSearchType, appliedSearchText]);

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

  // boardIdx, cPage, appliedSearchType, appliedSearchText가 바뀔 때만 실제 검색!
  useEffect(() => {
    callData();
  }, [boardIdx, cPage, appliedSearchType, appliedSearchText, callData]);

  // 페이지 변경 함수
  function changePage(e, p) {
    setcPage(p);
  }

  // 검색 버튼 혹은 엔터 시 실행 함수
  function handleSearch(type, text) {
    setAppliedSearchType(type);
    setAppliedSearchText(text);
    setcPage(1);
  }

  // 카테고리 변경 함수
  function handleBoardIdxChange(newIdx) {
    setBoardIdx(newIdx);
    setcPage(1);
    // setSearchText(''); setSearchType('title'); // 카테고리 변경시 검색 상태 리셋 원하면 활성화
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
        setBoardIdx={handleBoardIdxChange}
        BOARD_CATEGORIES={BOARD_CATEGORIES}
        searchType={searchType}
        setSearchType={setSearchType}
        searchText={searchText}
        setSearchText={setSearchText}
        onSearch={handleSearch}
      />
    </div>
  );
}
