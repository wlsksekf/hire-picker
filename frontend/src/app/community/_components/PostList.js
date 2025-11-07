'use client';

import { useRouter } from "next/navigation";
import { Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Link from "next/link";

// ar: 게시글 목록
// tp: 전체 페이지 수
// cp: 페이지 변경 함수
// isLoggedIn: 로그인 여부
// loading: 로딩 상태
// currentUserType: 현재 로그인 유저 타입(PERSONAL/COMPANY 등)
// boardIdx, setBoardIdx: 선택된 카테고리값 및 변경함수
// BOARD_CATEGORIES: 카테고리 목록 배열
export default function PostList({ ar, tp, cp, isLoggedIn, loading, currentUserType, boardIdx, setBoardIdx, BOARD_CATEGORIES }) {
  const router = useRouter();

  return (
    <div>
      {/* 카테고리 버튼 목록 */}
      <div style={{ margin: "20px 0 16px 0", textAlign: "left" }}>
        {BOARD_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setBoardIdx(cat.value)}
            style={{
              marginRight: "10px",
              padding: "9px 16px",
              background: boardIdx === cat.value ? "#007bff" : "#eee",
              color: boardIdx === cat.value ? "#fff" : "#333",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

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
                <TableCell align="center">{row.postIdx}</TableCell>
                <TableCell align="center">{row.boardIdx}</TableCell>
                <TableCell align="center">
                  <Link href={`/community/${row.postIdx}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {row.title}
                  </Link>
                </TableCell>
                <TableCell align="center">{row.nickname}</TableCell>
                <TableCell align="center">{row.createdAt}</TableCell>
                <TableCell align="center">{row.viewCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* 하단: 페이징(좌) + 글쓰기 버튼(우) */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          padding: "0 10px",
          marginBottom: "10px"
        }}>
          <div>
            <Pagination count={tp} color="primary" onChange={cp} />
          </div>
          <div>
            {!loading && isLoggedIn && String(currentUserType).toLowerCase() === "personal" && (
              <button
                style={{
                  padding: "10px 20px",
                  borderRadius: "7px",
                  background: "#007bff",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  border: "none"
                }}
                onClick={() => router.push('/community/write')}
              >
                글쓰기
              </button>
            )}
          </div>
        </div>
      </TableContainer>
    </div>
  );
}
