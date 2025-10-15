'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Stack,
  CircularProgress,
  CardActions,
  Button,
} from '@mui/material';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiKey = '3e10252a-2cfe-4b5a-add7-49ac2f8d6cfa'; // 여기에 유효한 API 키를 입력하세요.

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        console.error("API 키를 입력해주세요.");
        setLoading(false);
        return;
      }

      const url = `/api/work24-companies?authKey=${apiKey}`;

      try {
        const response = await fetch(url);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const companyNodes = xmlDoc.getElementsByTagName('dhsOpenEmpHireInfo');

        // NOTE: API 문서에 coClcdNm 태그가 '회사명'과 '기업구분명' 두 번 사용되었습니다.
        // 여기서는 첫 번째 coClcdNm을 회사명으로 간주하고 파싱합니다.
        const companyData = Array.from(companyNodes).map(node => {
          const get = (tagName) => node.getElementsByTagName(tagName)[0]?.textContent || '';
          return {
            id: get('empCoNo'),
            name: get('coClcdNm'), 
            summary: get('coIntroSummaryCont'),
            homepage: get('homepg'),
          };
        });

        setCompanies(companyData);
      } catch (error) {
        console.error("공채 기업 정보를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [apiKey]);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        공채 기업 정보
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {companies.map((company) => (
            <Card key={company.id} sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              p: 3
            }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">{company.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {company.summary}
                </Typography>
              </Box>
              <CardActions sx={{ justifyContent: 'flex-end', p: 0, mt: 2 }}>
                {company.homepage && (
                  <Button 
                    variant="contained"
                    href={company.homepage.startsWith('http') ? company.homepage : `http://${company.homepage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    홈페이지
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default CompaniesPage;
