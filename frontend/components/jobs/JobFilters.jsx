'use client';
import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';

const filterGroups = [
  { label: "직무 유형", options: ["모든 유형", "정규직", "계약직", "프리랜서", "원격"] },
  { label: "경력 수준", options: ["모든 수준", "신입", "주니어", "시니어", "임원"] },
  { label: "근무 지역", options: ["모든 지역", "서울", "부산", "인천", "원격"] },
  { label: "급여 범위", options: ["모든 급여", "3천만원 미만", "3천만원 - 5천만원", "5천만원 - 7천만원", "7천만원 이상"] }
];

export function JobFilters() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Filters
        </Typography>
        <Stack spacing={3}>
          {filterGroups.map((group) => (
            <FormControl fullWidth key={group.label}>
              <InputLabel>{group.label}</InputLabel>
              <Select label={group.label} defaultValue={group.options[0]}>
                {group.options.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}