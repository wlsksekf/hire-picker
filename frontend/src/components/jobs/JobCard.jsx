'use client';
import { Card, CardContent, Typography, Box, Button, Chip, Stack } from '@mui/material';

export function JobCard({ job }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h3">{job.title}</Typography>
            <Typography color="text.secondary" gutterBottom>{job.company}</Typography>
            <Typography variant="body2" color="text.secondary">{job.location}</Typography>
          </Box>
          <Chip label={job.type} size="small" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {job.description}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" fontWeight="bold">
            {job.salary}
          </Typography>
          <Button variant="contained">지원하기</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}