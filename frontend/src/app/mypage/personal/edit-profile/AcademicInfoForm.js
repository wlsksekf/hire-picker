'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import { getAcademics, saveAcademics, searchSchools } from '@/api';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';

// 학력 편집 폼 (학교코드 기반 저장)
export default function AcademicInfoForm() {
  const [academics, setAcademics] = useState([]); // 행 데이터 (UI 표시)
  const [options, setOptions] = useState([]); // 학교 자동완성 옵션

  // 초기 로드: 학력 조회
  useEffect(() => {
    getAcademics()
      .then((list) => {
        const mapped = (list || []).map((a, idx) => ({
          id: idx + 1,
          schoolCode: a.schoolCode || '', // 저장용(숨김)
          schoolName: a.schoolName || '', // 표시용
          degree: a.degree || '',
          major: a.major || '',
          gpa: a.majorScore != null ? String(a.majorScore) : ''
        }));
        setAcademics(mapped);
      })
      .catch(() => setAcademics([]));
  }, []);

  function handleAddRow() {
    setAcademics([...academics, { id: Date.now(), schoolCode: '', schoolName: '', degree: '', major: '', gpa: '' }]);
  }

  function handleRemoveRow(id) {
    setAcademics(academics.filter(item => item.id !== id));
  }

  function handleChange(e, id) {
    const { name, value } = e.target;
    setAcademics(academics.map(item => (item.id === id ? { ...item, [name]: value } : item)));
  }

  async function handleSubmit() {
    const payload = academics.map(a => ({
      schoolCode: a.schoolCode ? Number(a.schoolCode) : null,
      degree: a.degree,
      major: a.major,
      majorScore: a.gpa ? Number(a.gpa) : null,
    }));
    await saveAcademics(payload);
    alert('학력 정보가 저장되었습니다.');
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>학력 정보 수정</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>학교명</TableCell>
              <TableCell>학과</TableCell>
              <TableCell>졸업구분</TableCell>
              <TableCell>학점</TableCell>
              <TableCell>관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {academics.map(academic => (
              <TableRow key={academic.id}>
                <TableCell>
                  <Autocomplete
                    freeSolo
                    value={academic.schoolName}
                    onInputChange={async (_, val) => {
                      handleChange({ target: { name: 'schoolName', value: val } }, academic.id);
                      if (val && val.length >= 2) {
                        const res = await searchSchools(val);
                        setOptions(res || []);
                      } else {
                        setOptions([]);
                      }
                    }}
                    onChange={(_, option) => {
                      if (option && option.schoolCode) {
                        const e1 = { target: { name: 'schoolCode', value: String(option.schoolCode) } };
                        const e2 = { target: { name: 'schoolName', value: option.schoolName } };
                        handleChange(e1, academic.id);
                        handleChange(e2, academic.id);
                      }
                    }}
                    options={options}
                    getOptionLabel={(o) => (typeof o === 'string' ? o : `${o.schoolName}${o.campus ? ' (' + o.campus + ')' : ''}`)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="학교명"
                        size="small"
                        // 자리표시자(placeholder) 글자 크기 축소
                        sx={{
                          minWidth: 140,
                          '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' },
                          '& .MuiInputBase-input::placeholder': { fontSize: 11 }
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="major"
                    value={academic.major}
                    onChange={e => handleChange(e, academic.id)}
                    placeholder="학과"
                    size="small"
                    // 자리표시자(placeholder) 글자 크기 축소
                    sx={{
                      minWidth: 140,
                      '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' },
                      '& .MuiInputBase-input::placeholder': { fontSize: 11 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    name="degree"
                    value={academic.degree}
                    onChange={e => handleChange(e, academic.id)}
                    size="small"
                    sx={{ minWidth: 110, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' } }}
                  >
                    <MenuItem value="">선택</MenuItem>
                    <MenuItem value="고졸">고졸</MenuItem>
                    <MenuItem value="학사">학사</MenuItem>
                    <MenuItem value="석사">석사</MenuItem>
                    <MenuItem value="박사">박사</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    name="gpa"
                    value={academic.gpa}
                    onChange={e => handleChange(e, academic.id)}
                    placeholder="예: 3.8"
                    size="small"
                    // 자리표시자(placeholder) 글자 크기 축소
                    sx={{
                      minWidth: 80,
                      maxWidth: 90,
                      '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' },
                      '& .MuiInputBase-input::placeholder': { fontSize: 11 }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleRemoveRow(academic.id)}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button startIcon={<AddCircleOutline />} onClick={handleAddRow}>
          학력 추가
        </Button>
        <Button variant="contained" onClick={handleSubmit}>학력 정보 저장</Button>
      </Box>
    </Box>
  );
}
