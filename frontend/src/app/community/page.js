'use client';
import axios from "axios";
import { useEffect, useState } from "react";
import PostList from "./_components/PostList";

export default function Page() {
  const api_url = "/api/posts";
  const [bname, setBname] = useState('BBS');
  const [list, setList] = useState([]);
  const [cPage, setcPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);   // ★ 로그인 상태
  const [loading, setLoading] = useState(true);

  // 게시글 데이터 불러오기
  function callData() {
    axios.get(api_url, {
      params: { bname: bname, cPage: cPage },
      withCredentials: true
    })
    .then(response => {
      const data = response.data.data;
      setList(data.list || []);
      setTotalPage(data.totalPages || 0);
      setcPage(data.cPage || 1);
    })
    .catch(error => {
      console.error("데이터 통신 중 오류 발생:", error);
    });
  }

  // ★ 로그인 상태 확인 useEffect
  useEffect(() => {
    axios.get('/api/posts/me', { withCredentials: true })
      .then(response => {
        setIsLoggedIn(response.data.authenticated === true);
      })
      .catch(error => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 게시글 데이터 불러오기 useEffect
  useEffect(() => {
    callData();
    // eslint-disable-next-line
  }, [cPage]);

  // 페이지 변경 함수
  function changePage(e, p) {
    setcPage(p);
  }

  return (
    <div style={{ width: "90%", margin: "auto", padding: "20px" }}>
      {/* ★ 글쓰기 버튼 삭제. 버튼은 이제 PostList에서 조건부로 랜더링됨 */}
      <PostList ar={list} tp={totalPage} cp={changePage} isLoggedIn={isLoggedIn} loading={loading} />
    </div>
  );
}
