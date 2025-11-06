'use client';

import { Container, Paper, Typography } from '@mui/material';
import AcademicInfoForm from '../AcademicInfoForm';

export default function AcademicEditPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        학력 수정
      </Typography>
      <Paper sx={{ p: 3 }}>
        <AcademicInfoForm />
      </Paper>
    </Container>
  );
}

