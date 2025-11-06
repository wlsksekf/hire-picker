'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { getMilitary, saveMilitary } from '@/api';

export default function MilitaryInfoForm() {
  const [militaryInfo, setMilitaryInfo] = useState({
    serviceType: '',
    militaryBranch: '',
    militaryRank: '',
    periodOfService: '',
    reasonForExemption: ''
  });

  useEffect(() => {
    getMilitary().then((m) => {
      if (m) setMilitaryInfo(m);
    });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setMilitaryInfo({ ...militaryInfo, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await saveMilitary(militaryInfo);
    alert('병역 정보가 저장되었습니다.');
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>병역 정보 수정</Typography>
      <RadioGroup row name="serviceType" value={militaryInfo.serviceType} onChange={handleChange}
        sx={{ '& .MuiFormControlLabel-label': { fontSize: 12 } }}>
        <FormControlLabel value="병역" control={<Radio size="small" />} label="병역" />
        <FormControlLabel value="미필" control={<Radio size="small" />} label="미필" />
        <FormControlLabel value="면제" control={<Radio size="small" />} label="면제" />
      </RadioGroup>
      <TextField name="militaryBranch" label="병과" value={militaryInfo.militaryBranch} onChange={handleChange}
        size="small" margin="dense" sx={{ maxWidth: 240, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
      <TextField name="militaryRank" label="계급" value={militaryInfo.militaryRank} onChange={handleChange}
        size="small" margin="dense" sx={{ maxWidth: 240, ml: 2, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
      <TextField name="periodOfService" label="복무기간" value={militaryInfo.periodOfService} onChange={handleChange}
        size="small" margin="dense" sx={{ display: 'block', maxWidth: 340, mt: 1, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
      <TextField name="reasonForExemption" label="면제사유" value={militaryInfo.reasonForExemption} onChange={handleChange}
        size="small" margin="dense" sx={{ display: 'block', maxWidth: 340, '& .MuiInputBase-input': { fontSize: 12, padding: '4px 8px' }, '& .MuiInputBase-input::placeholder': { fontSize: 11 } }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button size="small" type="submit" variant="contained">병역 정보 저장</Button>
      </Box>
    </Box>
  );
}
