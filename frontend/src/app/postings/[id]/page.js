'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Chip,
  Button,
  Link as MuiLink
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faMapMarkerAlt, faBriefcase, faBuilding, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/api'; // 공용 api 인스턴스 사용

// 채용 공고 상세 페이지 컴포넌트
function PostingDetailPage() {
  const { id } = useParams(); // URL 파라미터에서 공고 ID 추출
  const [posting, setPosting] = useState(null); // 채용 공고 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 컴포넌트가 마운트되거나 ID가 변경될 때 채용 공고 정보를 불러옴
  useEffect(function() {
    if (id) {
      setLoading(true);
      api.get(`/api/work24/postings/${id}`)
        .then(function(response) {
          setPosting(response.data);
          setLoading(false);
        })
        .catch(function(err) {
          setError(err);
          setLoading(false);
        });
    }
  }, [id]);

  // 로딩 상태일 때
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>채용 공고 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러 상태일 때
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">채용 공고 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  // 채용 공고 정보가 없을 때
  if (!posting) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>채용 공고 정보를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={posting.companyLogoUrl}
            alt={`${posting.companyName} logo`}
            sx={{ width: 80, height: 80, mr: 3, border: '1px solid #e0e0e0' }}
          >
            {posting.companyName ? posting.companyName.charAt(0) : 'C'}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {posting.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {posting.companyName}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {posting.employmentType && (
            <Chip 
              icon={<FontAwesomeIcon icon={faBriefcase} />} 
              label={posting.employmentType} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {posting.location && (
            <Chip 
              icon={<FontAwesomeIcon icon={faMapMarkerAlt} />} 
              label={posting.location} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {posting.salary && (
            <Chip 
              icon={<FontAwesomeIcon icon={faMoneyBillWave} />} 
              label={posting.salary} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {posting.postedDate && (
            <Chip 
              icon={<FontAwesomeIcon icon={faCalendar} />} 
              label={`등록일: ${posting.postedDate}`} 
              color="primary" 
              variant="outlined" 
            />
          )}
        </Box>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          {posting.description}
        </Typography>

        {posting.homepageUrl && (
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button 
              variant="contained"
              href={posting.homepageUrl.startsWith('http') ? posting.homepageUrl : `http://${posting.homepageUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              지원하기
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default PostingDetailPage;
