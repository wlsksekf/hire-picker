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
  const [list, setList] = useState([]);         // 게시글 리스트
  const [cPage, setcPage] = useState(1);        // 현재 페이지
  const [totalPage, setTotalPage] = useState(0);// 전체 페이지 수
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [loading, setLoading] = useState(true);        // 로딩 상태
  const [currentUserType, setCurrentUserType] = useState(null);

  // 검색 관련 상태
  const [searchType, setSearchType] = useState('title');
  const [searchText, setSearchText] = useState('');

  // 게시글 데이터 불러오기 함수
  function callData() {
    setLoading(true);
    const params = { cPage };
    if (boardIdx !== '') params.boardIdx = boardIdx;
    if (searchText.trim() !== '') {
      params.type = searchType;
      params.query = searchText;
    }

    // boardIdx가 ""이면 전체글, 그 외에는 카테고리별
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

  // 주요 상태 변경 시 게시글 데이터 갱신
  useEffect(() => {
    callData();
    // eslint-disable-next-line
  }, [boardIdx, cPage, searchType, searchText]);

  // 페이지 변경 함수
  function changePage(e, p) {
    setcPage(p);
  }

  // 검색 처리 함수: PostList에서 onSearch로 내려줌
  function handleSearch(type, text) {
    setSearchType(type);
    setSearchText(text);
    setcPage(1);
  }

  // 카테고리 변경 함수 (검색조건 리셋은 취향 따라)
  function handleBoardIdxChange(newIdx) {
    setBoardIdx(newIdx);
    setcPage(1);
    // setSearchText(''); setSearchType('title'); // 필요시 검색조건 리셋 가능
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
