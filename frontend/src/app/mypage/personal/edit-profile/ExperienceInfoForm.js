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
  IconButton,
  Collapse
} from '@mui/material';
import { AddCircleOutline, DeleteOutline, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { getExperiences, saveExperiences } from '@/api';

function ExpandableRow({ exp, onRemove, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <TextField name="companyName" value={exp.companyName} onChange={e => onChange(e, exp.id)}
            size="small" sx={{ minWidth: 140, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
        </TableCell>
        <TableCell>
          <TextField name="department" value={exp.department} onChange={e => onChange(e, exp.id)}
            size="small" sx={{ minWidth: 120, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
        </TableCell>
        <TableCell>
          <TextField name="position" value={exp.position} onChange={e => onChange(e, exp.id)}
            size="small" sx={{ minWidth: 120, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
        </TableCell>
        <TableCell>
          <TextField name="hireDate" type="date" value={exp.hireDate} onChange={e => onChange(e, exp.id)}
            size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 115, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
        </TableCell>
        <TableCell>
          <TextField name="resignDate" type="date" value={exp.resignDate} onChange={e => onChange(e, exp.id)}
            size="small" InputLabelProps={{ shrink: true }} sx={{ minWidth: 115, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
        </TableCell>
        <TableCell>
          <IconButton onClick={() => onRemove(exp.id)}>
            <DeleteOutline />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                상세 정보
              </Typography>
              <TextField
                name="jobDescription"
                label="상세 업무 내용"
                value={exp.jobDescription}
                onChange={e => onChange(e, exp.id)}
                fullWidth
                multiline
                rows={3}
                margin="dense"
                size="small"
                sx={{ '& .MuiInputBase-input': { fontSize: 12, padding: '6px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }}
              />
              <TextField
                name="mainDuties"
                label="주요 직무"
                value={exp.mainDuties}
                onChange={e => onChange(e, exp.id)}
                fullWidth
                margin="dense"
                size="small"
                sx={{ '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ExperienceInfoForm() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    getExperiences()
      .then(list => {
        const mapped = (list || []).map((e, idx) => ({
          id: idx + 1,
          companyName: e.companyName || '',
          department: e.department || '',
          position: e.position || '',
          hireDate: e.hireDate || '',
          resignDate: e.resignDate || '',
          jobDescription: e.jobDescription || '',
          mainDuties: e.mainDuties || ''
        }));
        setExperiences(mapped);
      })
      .catch(() => setExperiences([]));
  }, []);

  function handleAddRow() {
    setExperiences([...experiences, { id: Date.now(), companyName: '', department: '', position: '', hireDate: '', resignDate: '', jobDescription: '', mainDuties: '' }]);
  }

  function handleRemoveRow(id) {
    setExperiences(experiences.filter(item => item.id !== id));
  }

  function handleChange(e, id) {
    const { name, value } = e.target;
    setExperiences(experiences.map(item => (item.id === id ? { ...item, [name]: value } : item)));
  }

  async function handleSubmit() {
    const payload = experiences.map(e => ({
      companyName: e.companyName,
      department: e.department,
      position: e.position,
      hireDate: e.hireDate || null,
      resignDate: e.resignDate || null,
      jobDescription: e.jobDescription,
      mainDuties: e.mainDuties,
    }));
    await saveExperiences(payload);
    alert('경력 정보가 저장되었습니다.');
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>경력 정보 수정</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>회사명</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>직책</TableCell>
              <TableCell>입사일</TableCell>
              <TableCell>퇴사일</TableCell>
              <TableCell>관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {experiences.map(exp => (
              <ExpandableRow key={exp.id} exp={exp} onRemove={handleRemoveRow} onChange={handleChange} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button size="small" startIcon={<AddCircleOutline fontSize="small" />} onClick={handleAddRow}>
          경력 추가
        </Button>
        <Button size="small" variant="contained" onClick={handleSubmit}>경력 정보 저장</Button>
      </Box>
    </Box>
  );
}
