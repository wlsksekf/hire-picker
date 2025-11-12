import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { api } from '@/api';

export default function ResumeApplyDialog({ open, job, onClose, onSuccess }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedResumeId(null);
      fetchResumes();
    } else {
      setResumes([]);
      setError('');
      setLoading(false);
      setSubmitting(false);
    }
  }, [open]);

  function fetchResumes() {
    setLoading(true);
    setError('');
    api
      .get('/api/resumes')
      .then((response) => {
        setResumes(Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(response.data) && response.data.length === 1) {
          setSelectedResumeId(response.data[0].id);
        }
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          '이력서 목록을 불러오는 중 오류가 발생했습니다.';
        setError(typeof message === 'string' ? message : JSON.stringify(message));
      })
      .finally(() => setLoading(false));
  }

  function handleSubmit() {
    if (!job?.postingIdx) {
      setError('지원할 공고 정보를 찾을 수 없습니다.');
      return;
    }
    if (!selectedResumeId) {
      setError('지원할 이력서를 선택해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    api
      .post(`/api/postings/${job.postingIdx}/apply`, { resumeId: selectedResumeId })
      .then((response) => {
        const data = response?.data || {};
        if (data.redirectUrl) {
          window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
        }
        if (typeof onSuccess === 'function') {
          onSuccess({
            success: data.success !== false,
            message: data.message || '지원이 완료되었습니다.',
            redirected: Boolean(data.redirectUrl),
          });
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          '지원 처리 중 오류가 발생했습니다.';
        setError(typeof message === 'string' ? message : JSON.stringify(message));
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>지원할 이력서를 선택하세요</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : resumes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            등록된 이력서가 없습니다. 이력서를 작성한 후 지원해 주세요.
          </Typography>
        ) : (
          <RadioGroup
            value={selectedResumeId ?? ''}
            onChange={(event) => {
              setSelectedResumeId(Number(event.target.value));
            }}
          >
            {resumes.map((resume) => (
              <FormControlLabel
                key={resume.id}
                value={resume.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {resume.title || '제목 없음'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {resume.status || '상태 정보 없음'}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        )}
        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || loading || resumes.length === 0}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : '지원하기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

