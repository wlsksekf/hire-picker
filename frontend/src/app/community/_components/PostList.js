'use client';

import { Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem, TextField } from "@mui/material";
import Link from "next/link";

// boardIdx 번호를 한글명으로 변환하는 함수
const getCategoryLabel = (idx) => {
  switch (String(idx)) {
    case "1":
      return "취준/이직";
    case "2":
      return "회사생활/커리어";
    case "3":
      return "자유주제";
    case "4":
      return "아티클";
    default:
      return idx;
  }
};

export default function PostList({
  ar, // 게시글 배열
  tp, // 전체 페이지 수
  cp, // 페이지 변경 핸들러 함수
  isLoggedIn, // 로그인 여부
  loading, // 로딩 상태
  currentUserType, // 유저 타입(예: PERSONAL)
  boardIdx, // 선택된 카테고리 번호
  setBoardIdx, // 카테고리 변경 함수
  BOARD_CATEGORIES, // 카테고리 목록 배열 (value,label)
  searchType, // 검색 종류 상태 (상위 컴포넌트에서 전달받음)
  setSearchType, // 검색 종류 변경 함수
  searchText, // 검색어 상태 (상위 컴포넌트에서 전달받음)
  setSearchText, // 검색어 변경 함수
  onSearch, // 실제 검색 실행 함수(상위 컴포넌트에서 전달받음)
}) {

  // 검색 버튼 클릭 및 엔터 시 실행
  const handleSearch = () => {
    onSearch(searchType, searchText); // props로 받은 상위 함수로 상태 변경
  };

  // 페이지 변경시
  const handlePageChange = (event, newPage) => {
    if (cp) cp(event, newPage); // 상위에서 실제 페이지 상태 변경
  };

  return (
    <div>
      {/* 카테고리 버튼 목록 */}
      <div style={{ margin: "20px 0 16px 0", textAlign: "left" }}>
        {BOARD_CATEGORIES.map(cat => (
          <Button
            key={cat.value}
            variant={boardIdx === cat.value ? "contained" : "outlined"}
            color="primary"
            sx={{
              marginRight: "10px",
              fontWeight: "bold",
              borderRadius: "6px"
            }}
            onClick={() => setBoardIdx(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* 게시글 테이블 */}
      <TableContainer component={Paper} sx={{ minWidth: 650 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">번호</TableCell>
              <TableCell align="center">카테고리</TableCell>
              <TableCell align="center">제목</TableCell>
              <TableCell align="center">글쓴이</TableCell>
              <TableCell align="center">등록일</TableCell>
              <TableCell align="center">조회수</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ar.map((row, i) => (
              <TableRow key={i} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                {/* 게시글 번호 */}
                <TableCell align="center">{row.postIdx}</TableCell>
                {/* 게시글 카테고리(번호 → 한글명 변환) */}
                <TableCell align="center">{getCategoryLabel(row.boardIdx)}</TableCell>
                {/* 제목: 상세페이지 링크 */}
                <TableCell align="center">
                  <Link href={`/community/${row.postIdx}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {row.title}
                  </Link>
                </TableCell>
                {/* 글쓴이, 등록일, 조회수 */}
                <TableCell align="center">{row.nickname}</TableCell>
                <TableCell align="center">{row.createdAt}</TableCell>
                <TableCell align="center">{row.viewCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 하단: 페이지 네비게이션, 글쓰기 버튼 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          padding: "0 10px",
          marginBottom: "10px"
        }}>
          {/* 페이지 이동 */}
          <div>
            <Pagination count={tp} color="primary" onChange={handlePageChange} />
          </div>
          {/* 글쓰기 버튼 (개인회원만 노출, 로딩중이면 숨김) */}
          <div>
            {!loading && isLoggedIn && String(currentUserType).toLowerCase() === "personal" && (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  padding: "10px 20px",
                  borderRadius: "7px",
                  fontWeight: "bold"
                }}
                onClick={() => window.location.href = '/community/write'}
              >
                글쓰기
              </Button>
            )}
          </div>
        </div>

        {/* 검색영역: 가운데 정렬, 적정 너비 */}
        <div style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          padding: "0 10px 20px",
          justifyContent: "center"
        }}>
          {/* 검색 종류 선택 */}
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            size="small"
            sx={{ minWidth: 120, textAlign: "center" }}
          >
            <MenuItem value="title">제목</MenuItem>
            <MenuItem value="nickname">글쓴이</MenuItem>
            <MenuItem value="content">내용</MenuItem>
          </Select>
          {/* 검색어 입력 */}
          <TextField
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            placeholder="검색어 입력"
            sx={{ width: 240 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            inputProps={{ style: { textAlign: "center" } }}
          />
          {/* 검색 버튼 */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ fontWeight: "bold" }}
            disabled={!searchText.trim()}
          >
            검색
          </Button>
        </div>
      </TableContainer>
    </div>
  );
}
