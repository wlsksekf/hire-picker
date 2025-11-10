'use client';
import React from 'react';
import { Modal, Box, Typography, Chip, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

export default function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  return (
    <Modal open={!!job} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        overflowY: 'auto'
      }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {job.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {job.companyName}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {job.employmentType && <Chip label={job.employmentType} />}
          {job.location && <Chip label={job.location} />}
          {job.experience_level && <Chip label={job.experience_level} />}
          {job.companyType && <Chip label={job.companyType} />}
          {job.jobType && <Chip label={job.jobType} />}
          {job.startDate && job.endDate && (
            <Chip
              icon={<FontAwesomeIcon icon={faCalendar} />}
              label={`${job.startDate} ~ ${job.endDate}`}
            />
          )}
        </Box>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {job.description || '상세 설명이 없습니다.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {job.homepageUrl && (
            <Button
              variant="contained"
              href={job.homepageUrl}
              target="_blank"
            >
              지원하기
            </Button>
          )}
          <Button variant="outlined" onClick={onClose}>
            닫기
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
