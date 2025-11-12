import { styled } from '@mui/material/styles';
import { Card, TextField, Button } from '@mui/material';

// 토스/당근 스타일 카드
export const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: '1px solid #f0f0f0',
  marginBottom: '16px',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s ease-in-out'
  }
}));

// 토스/당근 스타일 입력 필드
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#e0e0e0'
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px'
    }
  }
}));

// 토스/당근 스타일 버튼
export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  height: '44px',
  padding: '0 20px',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  }
}));

