// frontend/src/components/ResumePdfDocument.js (예시)
'use client'; // 만약 Next.js App Router에서 사용한다면

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// 1. (★필수★) 한글 폰트 등록 (Next.js public 폴더 기준)
// 이 코드는 클라이언트 사이드에서 한 번만 실행되어야 함
try {
  Font.register({ 
    family: 'NanumGothic', 
    src: '/fonts/NanumGothic-Regular.ttf' // public/fonts/NanumGothic-Regular.ttf
  });
  Font.register({ 
    family: 'NanumGothicBold', 
    src: '/fonts/NanumGothic-Bold.ttf' // public/fonts/NanumGothic-Bold.ttf
  });
} catch (e) {
  console.warn("폰트 등록 중 문제 발생 (서버 사이드 렌더링 시도 등):", e);
}


// 2. PDF 전용 스타일시트 (CSS가 아님!)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NanumGothic', // 1번에서 등록한 폰트 이름
    fontSize: 10,
    color: '#333',
  },
  h1: { 
    fontSize: 20, 
    textAlign: 'center', 
    marginBottom: 20, 
    fontFamily: 'NanumGothicBold' 
  },
  h2: { 
    fontSize: 14, 
    fontFamily: 'NanumGothicBold', 
    marginVertical: 10, 
    paddingBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  sectionTitle: { 
    fontSize: 11, 
    fontFamily: 'NanumGothicBold', 
    marginTop: 10, 
    marginBottom: 5,
    color: '#000',
  },
  // --- 테이블 스타일 ---
  table: { 
    display: 'table', 
    width: 'auto', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#bfbfbf',
    marginBottom: 15,
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableColHeader: { 
    width: '20%', 
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    backgroundColor: '#f2f2f2',
    padding: 6,
    fontFamily: 'NanumGothicBold',
  },
  tableCol: { 
    width: '80%', 
    padding: 6,
  },
  tableColSpan: {
    width: '80%',
    padding: 6,
  },
  // 자기소개서용 텍스트
  bodyText: {
    fontSize: 10,
    lineHeight: 1.4,
    textAlign: 'justify', // 양쪽 정렬
  }
});

// 3. PDF 문서 컴포넌트
// 폼 state인 resumeData를 props로 받아서 PDF를 그림
export default function ResumePdfDocument({ resumeData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <Text style={styles.h1}>입 사 지 원 서</Text>

        <Text style={styles.h2}>[인적사항]</Text>
        <View style={styles.table}>
          {/* 성명/성별 Row */}
          <View style={styles.tableRow}>
            <Text style={{...styles.tableColHeader, width: '20%'}}>성명</Text>
            <Text style={{...styles.tableCol, width: '30%'}}>{resumeData.name}</Text>
            <Text style={{...styles.tableColHeader, width: '20%'}}>성별</Text>
            <Text style={{...styles.tableCol, width: '30%', borderRightWidth: 0}}>{resumeData.gender}</Text>
          </View>
          {/* 휴대폰/Email Row */}
          <View style={styles.tableRow}>
            <Text style={{...styles.tableColHeader, width: '20%'}}>휴 대 폰</Text>
            <Text style={{...styles.tableCol, width: '30%'}}>{resumeData.phone}</Text>
            <Text style={{...styles.tableColHeader, width: '20%'}}>E-mail</Text>
            <Text style={{...styles.tableCol, width: '30%', borderRightWidth: 0}}>{resumeData.email}</Text>
          </View>
          {/* 주소 Row */}
          <View style={{...styles.tableRow, borderBottomWidth: 0}}>
            <Text style={{...styles.tableColHeader, width: '20%'}}>주 소</Text>
            <Text style={{...styles.tableCol, width: '80%', borderRightWidth: 0}}>{resumeData.address}</Text>
          </View>
        </View>

        {/* ... (학력사항, 자격증 등도 위와 같이 <View>로 테이블을 그려줌) ... */}

        <Text style={styles.h2}>[자기소개서]</Text>
        
        <Text style={styles.sectionTitle}>■ 성장과정</Text>
        <Text style={styles.bodyText}>{resumeData.growthProcess}</Text>

        <Text style={styles.sectionTitle}>■ 업무 관련 역량</Text>
        <Text style={styles.bodyText}>{resumeData.jobCompetencies}</Text>

        <Text style={styles.sectionTitle}>■ 성격 장단점</Text>
        <Text style={styles.bodyText}>{resumeData.prosAndCons}</Text>

        <Text style={styles.sectionTitle}>■ 입사 후 포부</Text>
        <Text style={styles.bodyText}>{resumeData.aspirations}</Text>

      </Page>
    </Document>
  );
}
