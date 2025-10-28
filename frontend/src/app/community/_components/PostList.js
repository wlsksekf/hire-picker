import { useRouter } from "next/navigation";
import { Button, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "node_modules/@mui/material";


export default function PostList({ar, tp, cp}){
    const router = useRouter();
    return(
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}}>
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
                        <TableRow
                        key={i}
                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                        <TableCell component="th" scope="row" align="center">
                            {row.post_idx}
                        </TableCell>
                        <TableCell align="center">{row.title}</TableCell>
                        <TableCell align="center">{row.p_user_idx}</TableCell>
                        <TableCell align="center">{row.created_at}</TableCell>
                        <TableCell align="center">{row.view_count}</TableCell>
                        </TableRow>
                    ))}
                    {/* 다음은 페이징 기법을 위한 행이 하나 추가되어야 한다.*/}
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Pagination count={tp} color="primary"
                                onChange={cp}/>
                        </TableCell>
                        <TableCell
                        sx={{
                            diplay: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'left',
                            height: '100%',//높이를 부모에 맞춤(수직 정렬을 위해)
                            paddingRight: 2 //
                        }}
                        >
                            <Button variant="contained" color="primary"
                                onClick={function(){
                                    //현재 글쓰기 버튼을 클릭할 때마다 수행하는 곳!
                                    router.push("/api/posts/write");
                                }}>
                                    글쓰기
                                </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}