'use client';

import { Container, Paper, Typography } from '@mui/material';
import ExperienceInfoForm from '../ExperienceInfoForm';

export default function ExperienceEditPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        경력 수정
      </Typography>
      <Paper sx={{ p: 3 }}>
        <ExperienceInfoForm />
      </Paper>
    </Container>
  );
}

