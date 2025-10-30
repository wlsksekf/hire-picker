// import { useRouter } from "next/navigation"; // 라우팅 모듈 임포트 오류 해결을 위해 주석 처리
import { Button, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"; 
// import Link from "next/link"; // 라우팅 모듈 임포트 오류 해결을 위해 주석 처리

export default function PostList({ar, tp, cp}){
    // const router = useRouter(); // 라우팅 모듈 임포트 오류 해결을 위해 주석 처리
    
    // 제목 클릭 시 상세 페이지로 이동하는 핸들러
    const handleTitleClick = (postIdx) => {
        // window.location.href를 사용하여 페이지 이동을 시뮬레이션
        window.location.href = `/community/${postIdx}`;
    };

    // 글쓰기 버튼 클릭 시 작성 페이지로 이동하는 핸들러
    const handleWriteClick = () => {
        // window.location.href를 사용하여 페이지 이동을 시뮬레이션
        window.location.href = "/community/write";
    };

    return(
        <TableContainer component={Paper} sx={{ marginTop: 4, borderRadius: 2, boxShadow: 3 }}>
            <Table sx={{minWidth: 650}} aria-label="게시글 목록">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>번호</TableCell>
                        <TableCell align="left" sx={{ fontWeight: 'bold' }}>제목</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>글쓴이</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>등록일</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>조회수</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ar.map((row, i) => (
                        <TableRow
                        key={i}
                        sx={{'&:last-child td, &:last-child th': {border: 0}, '&:hover': {backgroundColor: '#fafafa'}}}
                        >
                        <TableCell component="th" scope="row" align="center">
                            {row.post_idx}
                        </TableCell>
                        {/* Link 대신 onClick 핸들러를 사용하여 이동 처리 */}
                        <TableCell 
                            align="left"
                            onClick={() => handleTitleClick(row.post_idx)} 
                            sx={{
                                color: '#007bff', 
                                cursor: 'pointer', 
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' } 
                            }}
                        >
                            {row.title}
                        </TableCell>
                        <TableCell align="center">{row.p_user_idx}</TableCell>
                        <TableCell align="center">{row.created_at}</TableCell>
                        <TableCell align="center">{row.view_count}</TableCell>
                        </TableRow>
                    ))}
                    {/* 다음은 페이징 기법을 위한 행이 하나 추가되어야 한다.*/}
                    <TableRow>
                        <TableCell colSpan={4} sx={{ borderBottom: 'none' }}>
                            {/* 페이징 컴포넌트 중앙 정렬을 위한 div 추가 */}
                            <div style={{ display: 'flex', justifyContent: 'left', padding: '10px 0' }}>
                                <Pagination 
                                    count={tp} 
                                    color="primary"
                                    onChange={cp}
                                    sx={{ '& .MuiPaginationItem-root': { borderRadius: '6px' } }}
                                />
                            </div>
                        </TableCell>
                        <TableCell
                            align="right"
                            sx={{
                                borderBottom: 'none',
                                padding: '16px',
                            }}
                        >
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={handleWriteClick}
                                sx={{ 
                                    padding: '8px 20px', 
                                    borderRadius: '8px',
                                    boxShadow: 3
                                }}
                            >
                                글쓰기
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
