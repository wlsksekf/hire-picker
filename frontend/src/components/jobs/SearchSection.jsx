'use client';
import { Box, Typography, TextField, Button, InputAdornment, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export function SearchSection() {
  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      py: { xs: 6, md: 8 },
      textAlign: 'center'
    }}>
      <Container>
        <Typography variant="h1" component="h1" gutterBottom>
          사람을 잇다. 이음
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          당신과 이어질 기업을 검색하세요
        </Typography>
        <Box
          component="form"
          sx={{ maxWidth: 600, mx: 'auto', display: 'flex', gap: 1, alignItems: 'center' }} // alignItems 추가
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for jobs, companies, or keywords..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '50px',
                backgroundColor: 'background.paper',
                // InputBase의 기본 패딩이 TextField에 영향을 줄 수 있으므로 조절
                '.MuiOutlinedInput-root': {
                    paddingRight: '1rem', // 버튼과의 간격을 확보하면서 내부 패딩 조정
                }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              borderRadius: '50px',
              px: 3, // 좌우 패딩을 넉넉하게
              minWidth: '100px', // 버튼의 최소 너비 지정 (텍스트가 잘리지 않도록)
              height: '56px' // TextField와 높이를 맞춤 (variant="outlined" 기본 높이)
            }}
          >
            검색
          </Button>
        </Box>
      </Container>
    </Box>
  );
}