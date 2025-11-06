'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Paper, Box, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';

export default function ResumeDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/resume/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`상세 조회 실패: ${res.status}`);
        const json = await res.json();
        if (!ignore) setData(json);
      } catch (e) {
        if (!ignore) setError(e.message || '상세를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [id]);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        {loading && <Typography>불러오는 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {data && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{data.title || '이력서'}</Typography>
              <Typography variant="body2" color="text.secondary">
                최종 수정일: {data.modifiedDate ? new Date(data.modifiedDate).toISOString().slice(0,10) : '-'}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* 이미지 */}
            {data.imageUrl && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <img src={data.imageUrl} alt="프로필" style={{ maxWidth: 240, maxHeight: 240, objectFit: 'contain' }} />
              </Box>
            )}

            {/* write_resume와 동일한 테이블/섹션 구성(읽기 전용) */}
            <InfoTables data={data} />

            {/* 기타 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">공개 상태</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {data.status === 'PUBLIC' ? '공개' : data.status === 'PRIVATE' ? '비공개' : '-'}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">자격 요약</Typography>
              <Typography variant="body1" whiteSpace="pre-line">{data.cert || '-'}</Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

function Section({ title, text }) {
  if (!text) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>{title}</Typography>
      <Typography variant="body1" whiteSpace="pre-line">{text}</Typography>
    </Box>
  );
}

// 스타일: write_resume와 유사한 라벨/입력 셀 스타일
const StyledLabelCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  fontWeight: 'bold',
  border: '1px solid #ccc',
  textAlign: 'center',
  width: '15%',
}));

const StyledValueCell = styled(TableCell)(() => ({
  border: '1px solid #ccc',
  padding: '4px 8px',
}));

function InfoTables({ data }) {
  const p = data.personal || {};
  const academics = Array.isArray(data.academics) ? data.academics : [];
  const exps = Array.isArray(data.experiences) ? data.experiences : [];
  const m = data.military || null;

  return (
    <>
      {/* 개인정보 */}
      <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>[개인정보]</Typography>
      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <StyledLabelCell>이름</StyledLabelCell>
              <StyledValueCell width="35%">{p.name || '-'}</StyledValueCell>
              <StyledLabelCell>성별</StyledLabelCell>
              <StyledValueCell width="35%">{p.gender || '-'}</StyledValueCell>
            </TableRow>
            <TableRow>
              <StyledLabelCell>전화</StyledLabelCell>
              <StyledValueCell width="35%">{p.phone || '-'}</StyledValueCell>
              <StyledLabelCell>E-mail</StyledLabelCell>
              <StyledValueCell width="35%">{p.email || '-'}</StyledValueCell>
            </TableRow>
            <TableRow>
              <StyledLabelCell>주소</StyledLabelCell>
              <StyledValueCell colSpan={3}>{p.address || '-'}</StyledValueCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 학력사항 */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>[학력사항]</Typography>
      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledLabelCell>학교</StyledLabelCell>
              <StyledLabelCell>학위</StyledLabelCell>
              <StyledLabelCell>전공</StyledLabelCell>
              <StyledLabelCell>학점</StyledLabelCell>
              <StyledLabelCell>졸업일</StyledLabelCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {academics.length === 0 && (
              <TableRow>
                <StyledValueCell colSpan={5}>학력 정보가 없습니다.</StyledValueCell>
              </TableRow>
            )}
            {academics.map((a, idx) => (
              <TableRow key={idx}>
                <StyledValueCell>{a.schoolName || '-'}</StyledValueCell>
                <StyledValueCell>{a.degree || '-'}</StyledValueCell>
                <StyledValueCell>{a.major || '-'}</StyledValueCell>
                <StyledValueCell>{a.majorScore ?? '-'}</StyledValueCell>
                <StyledValueCell>{a.graduationDate || '-'}</StyledValueCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 경력사항 */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>[경력사항]</Typography>
      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledLabelCell>회사</StyledLabelCell>
              <StyledLabelCell>부서</StyledLabelCell>
              <StyledLabelCell>직책</StyledLabelCell>
              <StyledLabelCell>입사일</StyledLabelCell>
              <StyledLabelCell>퇴사일</StyledLabelCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exps.length === 0 && (
              <TableRow>
                <StyledValueCell colSpan={5}>경력 정보가 없습니다.</StyledValueCell>
              </TableRow>
            )}
            {exps.map((w, idx) => (
              <TableRow key={idx}>
                <StyledValueCell>{w.companyName || '-'}</StyledValueCell>
                <StyledValueCell>{w.department || '-'}</StyledValueCell>
                <StyledValueCell>{w.position || '-'}</StyledValueCell>
                <StyledValueCell>{w.hireDate || '-'}</StyledValueCell>
                <StyledValueCell>{w.resignDate || '-'}</StyledValueCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 병역 */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>[병역]</Typography>
      <TableContainer sx={{ mb: 2 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <StyledLabelCell>유형</StyledLabelCell>
              <StyledValueCell>{m?.serviceType || '-'}</StyledValueCell>
              <StyledLabelCell>병과</StyledLabelCell>
              <StyledValueCell>{m?.militaryBranch || '-'}</StyledValueCell>
            </TableRow>
            <TableRow>
              <StyledLabelCell>계급</StyledLabelCell>
              <StyledValueCell>{m?.militaryRank || '-'}</StyledValueCell>
              <StyledLabelCell>복무기간</StyledLabelCell>
              <StyledValueCell>{m?.periodOfService || '-'}</StyledValueCell>
            </TableRow>
            <TableRow>
              <StyledLabelCell>면제 사유</StyledLabelCell>
              <StyledValueCell colSpan={3}>{m?.reasonForExemption || '-'}</StyledValueCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 자기소개 섹션들 */}
      <Section title="성장 배경" text={data.selfGrowth} />
      <Section title="성격/강점" text={data.selfStrengths} />
      <Section title="지원 동기" text={data.selfMotivation} />
      <Section title="포부" text={data.selfAspirations} />
    </>
  );
}
