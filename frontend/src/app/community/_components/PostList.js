import { useRouter } from "next/navigation";
import { Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Link from "next/link";

export default function PostList({ ar, tp, cp, isLoggedIn, loading }) {
  const router = useRouter();

  return (
    <TableContainer component={Paper} sx={{ minWidth: 650 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">번호</TableCell>
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
      {/* ★ 페이징(좌) + 글쓰기버튼(우) 하단 양 끝 배치 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "16px"
      }}>
        {/* 왼쪽: 페이징 */}
        <div>
          <Pagination count={tp} color="primary" onChange={cp} />
        </div>
        {/* 오른쪽: 글쓰기 버튼(로그인 시만) */}
        <div>
          {!loading && isLoggedIn && (
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
  );
}
