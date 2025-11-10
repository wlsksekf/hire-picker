'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { AddCircleOutline, DeleteOutline, School } from '@mui/icons-material';
import { getAcademics, saveAcademics, searchSchools, findExactSchool } from '@/api';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import { StyledCard, StyledTextField, StyledButton } from './FormStyles';

const HIGH_SCHOOL_DEGREE = '고졸';
const isHighSchoolDegree = degree => degree === HIGH_SCHOOL_DEGREE;

// 학력 편집 폼 (학교코드 기반 저장)
export default function AcademicInfoForm() {
  const [academics, setAcademics] = useState([]); // 행 데이터 (UI 표시)
  const [optionsMap, setOptionsMap] = useState(new Map()); // 각 행별 옵션 맵 (행별로 독립적인 검색 결과)
  const [inputValues, setInputValues] = useState(new Map()); // 각 행별 입력값 (캠퍼스 정보 포함)
  const [errors, setErrors] = useState(new Map()); // 각 행별 에러 메시지
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 초기 로드: 학력 조회
  useEffect(() => {
    loadAcademics();
  }, []);

  // academics 변경 시 inputValues 동기화 (캠퍼스 정보 포함)
  useEffect(() => {
    setInputValues(prev => {
      const newMap = new Map(prev);
      academics.forEach(academic => {
        if (academic.schoolName) {
          const displayValue = `${academic.schoolName}${academic.campus ? ' (' + academic.campus + ')' : ''}`;
          newMap.set(academic.id, displayValue);
        } else if (!academic.schoolCode) {
          // schoolCode가 없으면 빈 문자열
          newMap.set(academic.id, '');
        }
      });
      return newMap;
    });
  }, [academics]);

  async function loadAcademics() {
    try {
      setLoading(true);
      setError(null);
      const list = await getAcademics();
      const mapped = (list || []).map((a, idx) => ({
        id: idx + 1,
        schoolCode: a.schoolCode || '', // 저장용(숨김)
        schoolName: a.schoolName || '', // 표시용
        campus: a.campus || '', // 캠퍼스 정보
        degree: a.degree || '',
        major: a.major || '',
        gpa: a.majorScore != null ? String(a.majorScore) : '',
        admissionDate: a.admissionDate || '',
        graduationDate: a.graduationDate || '' // 졸업일 추가
      }));
      setAcademics(mapped);
      
      // 저장된 학교 정보를 optionsMap에 추가 (표시용)
      setOptionsMap(prev => {
        const newMap = new Map(prev);
        mapped.forEach(academic => {
          if (academic.schoolCode) {
            const existingOptions = newMap.get(academic.id) || [];
            // 이미 같은 schoolCode가 있는지 확인
            const exists = existingOptions.some(opt => opt.schoolCode === Number(academic.schoolCode));
            if (!exists) {
              newMap.set(academic.id, [
                ...existingOptions,
                {
                  schoolCode: Number(academic.schoolCode),
                  schoolName: academic.schoolName,
                  campus: academic.campus
                }
              ]);
            }
          }
        });
        return newMap;
      });
      // inputValues는 useEffect에서 자동으로 동기화됨
    } catch (err) {
      console.error('학력 조회 실패:', err);
      setError('학력 정보를 불러오지 못했습니다.');
      setAcademics([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAddRow() {
    const newId = Date.now();
    setAcademics([...academics, { id: newId, schoolCode: '', schoolName: '', campus: '', degree: '', major: '', gpa: '', admissionDate: '', graduationDate: '' }]);
    // 새 행의 입력값 초기화
    setInputValues(prev => {
      const newMap = new Map(prev);
      newMap.set(newId, '');
      return newMap;
    });
  }

  function handleRemoveRow(id) {
    setAcademics(academics.filter(item => item.id !== id));
    // 입력값 맵에서도 제거
    setInputValues(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    // 옵션 맵에서도 제거
    setOptionsMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }

  function handleChange(e, id) {
    const { name, value } = e.target;
    const updated = academics.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, [name]: value };
      if (name === 'degree') {
        if (isHighSchoolDegree(value)) {
          next.major = '';
          next.gpa = '';
        }
      }
      return next;
    });
    setAcademics(updated);
    
    // 실시간 유효성 검사
    const academic = updated.find(item => item.id === id);
    if (academic) {
      validateAcademic(academic, id);
    }
  }

  function validateAcademic(academic, id) {
    const newErrors = new Map(errors);
    const fieldErrors = {};
    const isHighSchool = isHighSchoolDegree(academic.degree);

    // 학교명 검증
    // schoolName이 없으면 에러
    if (!academic.schoolName || academic.schoolName.trim() === '') {
      fieldErrors.schoolName = '학교명을 입력해주세요.';
    }
    // schoolName은 있지만 schoolCode가 없으면 (직접 입력 중이거나 옵션 선택 전) 경고 표시하지 않음
    // 저장 시에는 schoolCode가 필요하므로 저장 전에 검증

    // 학과 검증
    if (!isHighSchool) {
      if (!academic.major || academic.major.trim() === '') {
        fieldErrors.major = '학과를 입력해주세요.';
      }
    }

    // 졸업구분 검증
    if (!academic.degree || academic.degree.trim() === '') {
      fieldErrors.degree = '졸업구분을 선택해주세요.';
    }

    // 학점 검증
    if (!isHighSchool) {
      if (!academic.gpa || academic.gpa.trim() === '') {
        fieldErrors.gpa = '학점을 입력해주세요.';
      } else {
        const gpaNum = parseFloat(academic.gpa);
        if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 5) {
          fieldErrors.gpa = '학점은 0.0 ~ 5.0 사이의 값이어야 합니다.';
        }
      }
    } else if (academic.gpa && academic.gpa.trim() !== '') {
      const gpaNum = parseFloat(academic.gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 5) {
        fieldErrors.gpa = '학점은 0.0 ~ 5.0 사이의 값이어야 합니다.';
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      newErrors.set(id, fieldErrors);
    } else {
      newErrors.delete(id);
    }
    setErrors(newErrors);
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // 모든 항목에 대해 유효성 검사 실행 및 에러 수집
      const allErrors = new Map();
      academics.forEach(academic => {
        const fieldErrors = {};
        const isHighSchool = isHighSchoolDegree(academic.degree);
        
        // 학교명 검증
        if (!academic.schoolName || academic.schoolName.trim() === '') {
          fieldErrors.schoolName = '학교명을 입력해주세요.';
        }
        
        // 학과 검증
        if (!isHighSchool) {
          if (!academic.major || academic.major.trim() === '') {
            fieldErrors.major = '학과를 입력해주세요.';
          }
        }
        
        // 졸업구분 검증
        if (!academic.degree || academic.degree.trim() === '') {
          fieldErrors.degree = '졸업구분을 선택해주세요.';
        }
        
        // 학점 검증
        if (!isHighSchool) {
          if (!academic.gpa || academic.gpa.trim() === '') {
            fieldErrors.gpa = '학점을 입력해주세요.';
          } else {
            const gpaNum = parseFloat(academic.gpa);
            if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 5) {
              fieldErrors.gpa = '학점은 0.0 ~ 5.0 사이의 값이어야 합니다.';
            }
          }
        } else if (academic.gpa && academic.gpa.trim() !== '') {
          const gpaNum = parseFloat(academic.gpa);
          if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 5) {
            fieldErrors.gpa = '학점은 0.0 ~ 5.0 사이의 값이어야 합니다.';
          }
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          allErrors.set(academic.id, fieldErrors);
        }
      });

      // 에러가 있으면 UI에 표시하고 저장 중단
      if (allErrors.size > 0) {
        setErrors(allErrors);
        setError('입력한 정보를 확인해주세요.');
        return;
      }

      // schoolName은 있지만 schoolCode가 없는 경우, 학교명으로 검색해서 schoolCode 찾기
      const academicsWithCode = await Promise.all(academics.map(async (a) => {
        // 이미 schoolCode가 있으면 그대로 사용
        if (a.schoolCode) {
          return a;
        }
        
        // schoolName이 없으면 그대로 반환 (나중에 필수 필드 검증에서 걸림)
        if (!a.schoolName || a.schoolName.trim() === '') {
          return a;
        }
        
        // schoolName으로 정확히 일치하는 학교 찾기
        try {
          // 먼저 정확히 일치하는 학교 찾기 시도
          const exactMatch = await findExactSchool(a.schoolName.trim());
          
          if (exactMatch) {
            return {
              ...a,
              schoolCode: exactMatch.schoolCode,
              campus: exactMatch.campus || a.campus,
              schoolName: exactMatch.schoolName
            };
          }
          
          // 정확히 일치하는 학교가 없으면 부분 일치 검색
          const searchResults = await searchSchools(a.schoolName.trim());
          
          if (!searchResults || searchResults.length === 0) {
            console.warn(`학교를 찾을 수 없습니다: ${a.schoolName}`);
            return a;
          }
          
          // 부분 일치 결과에서 정확히 일치하는 학교 찾기
          let matched = searchResults.find(s => s.schoolName === a.schoolName.trim());
          
          // 여전히 없으면 첫 번째 결과 사용
          if (!matched && searchResults.length > 0) {
            matched = searchResults[0];
            console.warn(`정확히 일치하는 학교를 찾지 못해 첫 번째 결과 사용: ${a.schoolName} -> ${matched.schoolName}`);
          }
          
          if (matched) {
            return {
              ...a,
              schoolCode: matched.schoolCode,
              campus: matched.campus || a.campus,
              schoolName: matched.schoolName
            };
          }
        } catch (err) {
          console.error('학교 검색 실패:', err);
        }
        
        return a;
      }));

      // 필수 필드 검증
      const invalidItems = academicsWithCode.filter(a => {
        const degree = a.degree;
        const isHighSchool = isHighSchoolDegree(degree);
        const hasMajor = a.major && a.major.trim() !== '';
        const hasGpa = a.gpa && a.gpa.trim() !== '';
        return !a.schoolCode || !degree || (!isHighSchool && (!hasMajor || !hasGpa));
      });
      if (invalidItems.length > 0) {
        setError('학교명을 선택하고, 졸업구분을 입력해주세요. 학과와 학점은 고졸이 아닌 경우에만 필수입니다.');
        return;
      }

      const payload = academicsWithCode
        .filter(a => {
          if (!a.schoolCode || !a.degree) return false;
          if (isHighSchoolDegree(a.degree)) return true;
          return a.major && a.major.trim() !== '' && a.gpa && a.gpa.trim() !== '';
        }) // 유효한 항목만
        .map(a => ({
          schoolCode: Number(a.schoolCode),
          degree: a.degree,
          major: a.major && a.major.trim() !== '' ? a.major.trim() : null,
          majorScore: a.gpa && a.gpa.trim() !== '' ? Number(a.gpa) : null,
          admissionDate: a.admissionDate || null,
          graduationDate: a.graduationDate || null
        }));

      await saveAcademics(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadAcademics(); // 저장 후 다시 조회
    } catch (err) {
      console.error('학력 저장 실패:', err);
      setError(err.response?.data?.message || '학력 정보 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <School sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '20px', color: '#212121' }}>
          학력 정보
        </Typography>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: '12px' }} 
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: '12px' }} 
          onClose={() => setSuccess(false)}
        >
          학력 정보가 저장되었습니다.
        </Alert>
      )}

      {academics.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: '#9e9e9e' }}>
          <School sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography>등록된 학력 정보가 없습니다.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {academics.map((academic, index) => {
            const isHighSchool = isHighSchoolDegree(academic.degree);
            return (
              <StyledCard key={academic.id}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#757575', fontWeight: 600 }}>
                      학력 {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRow(academic.id)}
                      sx={{
                        color: '#f44336',
                        '&:hover': { backgroundColor: '#ffebee' }
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                        학교명 *
                      </Typography>
                      <Autocomplete
                        freeSolo
                        value={academic.schoolName || ''}
                        onInputChange={async (_, val, reason) => {
                          if (reason !== 'input') {
                            return;
                          }

                          handleChange({ target: { name: 'schoolName', value: val } }, academic.id);

                          if (academic.schoolCode && val && val !== academic.schoolName) {
                            handleChange({ target: { name: 'schoolCode', value: '' } }, academic.id);
                            handleChange({ target: { name: 'campus', value: '' } }, academic.id);
                          }

                          if (val && val.length >= 2) {
                            const res = await searchSchools(val);
                            setOptionsMap(prev => {
                              const newMap = new Map(prev);
                              newMap.set(academic.id, res || []);
                              return newMap;
                            });
                          } else {
                            setOptionsMap(prev => {
                              const newMap = new Map(prev);
                              newMap.set(academic.id, []);
                              return newMap;
                            });
                          }
                        }}
                        onChange={(_, option) => {
                          if (option && option.schoolCode) {
                            handleChange({ target: { name: 'schoolCode', value: String(option.schoolCode) } }, academic.id);
                            handleChange({ target: { name: 'schoolName', value: option.schoolName } }, academic.id);
                            handleChange({ target: { name: 'campus', value: option.campus || '' } }, academic.id);
                          } else if (!option) {
                            handleChange({ target: { name: 'schoolCode', value: '' } }, academic.id);
                            handleChange({ target: { name: 'schoolName', value: '' } }, academic.id);
                            handleChange({ target: { name: 'campus', value: '' } }, academic.id);
                          }
                        }}
                        options={optionsMap.get(academic.id) || []}
                        getOptionLabel={(o) => {
                          if (!o) return '';
                          if (typeof o === 'string') return o;
                          const campus = o?.campus;
                          const schoolName = o?.schoolName || '';
                          return campus && campus.trim() ? `${schoolName} (${campus})` : schoolName;
                        }}
                        renderOption={(props, option) => {
                          const campus = option?.campus;
                          const schoolName = option?.schoolName || '';
                          const displayText = campus && campus.trim() ? `${schoolName} (${campus})` : schoolName;
                          return (
                            <li {...props} key={option.schoolCode}>
                              {displayText}
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            placeholder="학교명을 입력하세요"
                            fullWidth
                            error={errors.get(academic.id)?.schoolName ? true : false}
                            helperText={errors.get(academic.id)?.schoolName || ''}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                        학과 {isHighSchool ? '' : '*'}
                      </Typography>
                      <StyledTextField
                        name="major"
                        value={academic.major}
                        onChange={e => handleChange(e, academic.id)}
                        placeholder={isHighSchool ? '고졸 학력은 입력하지 않아도 됩니다' : '학과를 입력하세요'}
                        fullWidth
                        disabled={isHighSchool}
                        error={errors.get(academic.id)?.major ? true : false}
                        helperText={errors.get(academic.id)?.major || (isHighSchool ? '고졸 학력은 학과 입력이 선택 사항입니다.' : '')}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                        졸업구분 *
                      </Typography>
                      <StyledTextField
                        select
                        name="degree"
                        value={academic.degree}
                        onChange={e => handleChange(e, academic.id)}
                        fullWidth
                        error={errors.get(academic.id)?.degree ? true : false}
                        helperText={errors.get(academic.id)?.degree || ''}
                      >
                        <MenuItem value="">선택하세요</MenuItem>
                        <MenuItem value="고졸">고졸</MenuItem>
                        <MenuItem value="학사">학사</MenuItem>
                        <MenuItem value="석사">석사</MenuItem>
                        <MenuItem value="박사">박사</MenuItem>
                      </StyledTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                        학점 {isHighSchool ? '' : '*'}
                      </Typography>
                      <StyledTextField
                        name="gpa"
                        value={academic.gpa}
                        onChange={e => handleChange(e, academic.id)}
                        placeholder={isHighSchool ? '고졸 학력은 입력하지 않아도 됩니다' : '예: 3.8'}
                        type="number"
                        inputProps={{ min: 0, max: 5, step: 0.1 }}
                        fullWidth
                        disabled={isHighSchool}
                        error={errors.get(academic.id)?.gpa ? true : false}
                        helperText={errors.get(academic.id)?.gpa || (isHighSchool ? '고졸 학력은 학점 입력이 선택 사항입니다.' : '')}
                      />
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                        입학일
                      </Typography>
                      <StyledTextField
                        name="admissionDate"
                        type="date"
                        value={academic.admissionDate}
                        onChange={e => handleChange(e, academic.id)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ color: '#757575', mb: 0.5, display: 'block' }}>
                        졸업일
                      </Typography>
                      <StyledTextField
                        name="graduationDate"
                        type="date"
                        value={academic.graduationDate}
                        onChange={e => handleChange(e, academic.id)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            );
          })}
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
        <StyledButton 
          variant="outlined" 
          startIcon={<AddCircleOutline />} 
          onClick={handleAddRow}
          sx={{ 
            borderColor: '#e0e0e0',
            color: '#212121',
            '&:hover': { borderColor: 'primary.main', backgroundColor: 'rgba(25, 118, 210, 0.04)' }
          }}
        >
          학력 추가
        </StyledButton>
        <StyledButton 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장하기'}
        </StyledButton>
      </Box>
    </Box>
  );
}
