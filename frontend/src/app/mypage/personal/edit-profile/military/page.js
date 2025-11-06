'use client';

import { Container, Paper, Typography } from '@mui/material';
import MilitaryInfoForm from '../MilitaryInfoForm';

export default function MilitaryEditPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        병역 수정
      </Typography>
      <Paper sx={{ p: 3 }}>
        <MilitaryInfoForm />
      </Paper>
    </Container>
  );
}

