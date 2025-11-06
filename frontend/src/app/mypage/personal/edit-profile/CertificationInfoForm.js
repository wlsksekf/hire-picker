'use client';

import React, { useState } from 'react';
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

// 임시 데이터
const initialCertificationData = [
  {
    id: 1,
    name: '정보처리기사',
    issuer: '한국산업인력공단',
    issueDate: '2021-11-20'
  }
];

export default function CertificationInfoForm() {
  const [certifications, setCertifications] = useState(initialCertificationData);

  function handleAddRow() {
    setCertifications([...certifications, { id: Date.now(), name: '', issuer: '', issueDate: '' }]);
  }

  function handleRemoveRow(id) {
    setCertifications(certifications.filter(item => item.id !== id));
  }

  function handleChange(e, id) {
    const { name, value } = e.target;
    setCertifications(certifications.map(item => (item.id === id ? { ...item, [name]: value } : item)));
  }

  function handleSubmit() {
    // TODO: 백엔드에 데이터 전송 로직 추가
    console.log('저장할 자격증 정보:', certifications);
    alert('자격증 정보가 저장되었습니다. (콘솔 확인)');
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>자격증 정보 수정</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>자격증명</TableCell>
              <TableCell>발급기관</TableCell>
              <TableCell>취득일</TableCell>
              <TableCell>삭제</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certifications.map(cert => (
              <TableRow key={cert.id}>
                <TableCell>
                  <TextField name="name" value={cert.name} onChange={e => handleChange(e, cert.id)}
                    size="small" sx={{ minWidth: 160, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
                </TableCell>
                <TableCell>
                  <TextField name="issuer" value={cert.issuer} onChange={e => handleChange(e, cert.id)}
                    size="small" sx={{ minWidth: 160, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
                </TableCell>
                <TableCell>
                  <TextField name="issueDate" type="date" value={cert.issueDate} onChange={e => handleChange(e, cert.id)}
                    size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 120, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton size="small" onClick={() => handleRemoveRow(cert.id)}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button size="small" startIcon={<AddCircleOutline fontSize="small" />} onClick={handleAddRow}>
          자격증 추가
        </Button>
        <Button size="small" variant="contained" onClick={handleSubmit}>자격증 정보 저장</Button>
      </Box>
    </Box>
  );
}
