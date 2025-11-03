// 필터링 카테고리 및 옵션 정의
export const filterCategories = [
  {
    id: 'employmentType',
    label: '채용 형태',
    options: ['정규직', '계약직', '인턴', '프리랜서'],
  },
  {
    id: 'jobField',
    label: '직무 분야',
    options: ['프론트엔드', '백엔드', '풀스택', '데브옵스', '모바일', 'AI/ML'],
  },
  {
    id: 'experienceLevel',
    label: '경력 조건',
    options: ['신입', '1~3년', '4~6년', '7~9년', '10년 이상'],
  },
  {
    id: 'educationLevel',
    label: '학력 조건',
    options: ['고졸 이하', '초대졸', '대졸', '석사', '박사'],
  },
  {
    id: 'location',
    label: '근무 지역',
    options: ['서울', '경기', '인천', '부산', '원격'],
  },
  {
    id: 'salary',
    label: '급여 수준',
    options: ['~4000만', '4000만~6000만', '6000만~8000만', '8000만 이상'],
  },
  {
    id: 'companyType',
    label: '기업 형태',
    options: ['대기업', '중견기업', '중소기업', '스타트업', '외국계'],
  },
  {
    id: 'workingHours',
    label: '근무 시간',
    options: ['주 5일', '주 4일', '유연 근무', '시차 출퇴근'],
  },
  {
    id: 'benefits',
    label: '복리후생',
    options: ['스톡옵션', '식사 제공', '재택근무', '성과급'],
  },
  {
    id: 'otherFeatures',
    label: '기타 특성',
    options: ['병역특례', '수평적 문화', '빠른 성장'],
  },
  {
    id: 'workIntensity',
    label: '업무 강도',
    options: ['높음', '중간', '낮음'],
  },
];