// frontend/src/components/ResumePdfDocument.js (수정됨)
'use client';

import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// 한글 폰트 등록
try {
  Font.register({
    family: 'Pretendard',
    src: '/fonts/Pretendard-Medium.ttf'
  });
} catch (e) {
  console.warn("PDF 폰트 등록 중 문제 발생:", e);
}

// PDF 전용 스타일
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Pretendard',
    fontSize: 10,
    color: '#333',
  },
  h1: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontFamily: 'Pretendard' },
  h2: { fontSize: 14, fontFamily: 'Pretendard', marginVertical: 10, paddingBottom: 3, borderBottomWidth: 2, borderBottomColor: '#333' },
  sectionTitle: { fontSize: 12, fontFamily: 'Pretendard', marginTop: 12, marginBottom: 8, color: '#000' },
  // --- 테이블 스타일 ---
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', marginBottom: 15 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { width: '15%', borderRight: '1px solid #bfbfbf', backgroundColor: '#f2f2f2', padding: 5, fontFamily: 'Pretendard', textAlign: 'center' },
  tableCol: { padding: 5, borderRight: '1px solid #bfbfbf', textAlign: 'center' },
  photoBox: {
    width: 120,
    height: 160,
    border: '1px solid #bfbfbf',
    marginRight: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'

  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  photoPlaceholder: {
    fontSize: 10,
    color: '#888',
  },
  // 자기소개서용 텍스트
  bodyText: { fontSize: 10, lineHeight: 1.5, textAlign: 'justify' },
});

// PDF 문서 컴포넌트
export default function ResumePdfDocument({ formData, imageUrl }) {
  if (!formData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>이력서 데이터를 불러오는 중입니다...</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      {/* --- 1 페이지: 인적사항, 학력, 경력 등 --- */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>입 사 지 원 서</Text>

        {/* 인적사항 */}
        <Text style={styles.h2}>[인적사항]</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          {/* 사진 영역 */}
          <View style={styles.photoBox}>
            {imageUrl ? (
              <Image src={imageUrl} style={styles.profileImage} />
            ) : (
              <Text style={styles.photoPlaceholder}>사진</Text>
            )}
          </View>
          {/* 인적사항 테이블 */}
          <View style={{ flexGrow: 1 }}>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={{...styles.tableColHeader}}>성명</Text>
                <Text style={{...styles.tableCol, width: '35%'}}>{formData.name}</Text>
                <Text style={{...styles.tableColHeader}}>성별</Text>
                <Text style={{...styles.tableCol, width: '35%', borderRight: 0}}>{formData.gender}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={{...styles.tableColHeader}}>생년월일</Text>
                <Text style={{...styles.tableCol, width: '35%'}}>{formData.birthdate}</Text>
                <Text style={{...styles.tableColHeader}}>국적</Text>
                <Text style={{...styles.tableCol, width: '35%', borderRight: 0}}>{formData.nationality}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={{...styles.tableColHeader}}>휴대폰</Text>
                <Text style={{...styles.tableCol, width: '35%'}}>{formData.phone}</Text>
                <Text style={{...styles.tableColHeader}}>E-mail</Text>
                <Text style={{...styles.tableCol, width: '35%', borderRight: 0}}>{formData.email}</Text>
              </View>
              <View style={{...styles.tableRow, borderBottom: 0}}>
                <Text style={{...styles.tableColHeader}}>주소</Text>
                <Text style={{...styles.tableCol, width: '85%', borderRight: 0, textAlign: 'left'}}>{formData.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 학력사항 */}
        <Text style={styles.h2}>[학력사항]</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
              <Text style={{...styles.tableColHeader, width: '25%'}}>기간</Text>
              <Text style={{...styles.tableColHeader, width: '20%'}}>학교명</Text>
              <Text style={{...styles.tableColHeader, width: '20%'}}>학과</Text>
              <Text style={{...styles.tableColHeader, width: '15%'}}>졸업구분</Text>
              <Text style={{...styles.tableColHeader, width: '20%', borderRight: 0}}>학점</Text>
          </View>
          <View style={{...styles.tableRow}}>
              <Text style={{...styles.tableCol, width: '25%'}}>{formData.edu1_period}</Text>
              <Text style={{...styles.tableCol, width: '20%'}}>{formData.edu1_school}</Text>
              <Text style={{...styles.tableCol, width: '20%'}}>{formData.edu1_major}</Text>
              <Text style={{...styles.tableCol, width: '15%'}}>{formData.edu1_status}</Text>
              <Text style={{...styles.tableCol, width: '20%', borderRight: 0}}>{formData.edu1_score}</Text>
          </View>
          <View style={{...styles.tableRow, borderBottom: 0}}>
              <Text style={{...styles.tableCol, width: '25%'}}>{formData.edu2_period}</Text>
              <Text style={{...styles.tableCol, width: '20%'}}>{formData.edu2_school}</Text>
              <Text style={{...styles.tableCol, width: '20%'}}>{formData.edu2_major}</Text>
              <Text style={{...styles.tableCol, width: '15%'}}>{formData.edu2_status}</Text>
              <Text style={{...styles.tableCol, width: '20%', borderRight: 0}}>{formData.edu2_score}</Text>
          </View>
        </View>

        {/* 경력사항 */}
        <Text style={styles.h2}>[경력사항]</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
              <Text style={{...styles.tableColHeader, width: '25%'}}>근무기간</Text>
              <Text style={{...styles.tableColHeader, width: '20%'}}>회사명</Text>
              <Text style={{...styles.tableColHeader, width: '15%'}}>직위</Text>
              <Text style={{...styles.tableColHeader, width: '40%', borderRight: 0}}>담당업무</Text>
          </View>
          <View style={{...styles.tableRow}}>
              <Text style={{...styles.tableCol, width: '25%'}}>{formData.exp1_period}</Text>
              <Text style={{...styles.tableCol, width: '20%'}}>{formData.exp1_company}</Text>
              <Text style={{...styles.tableCol, width: '15%'}}>{formData.exp1_position}</Text>
              <Text style={{...styles.tableCol, width: '40%', borderRight: 0, textAlign: 'left'}}>{formData.exp1_duties}</Text>
          </View>
           <View style={{...styles.tableRow, borderBottom: 0}}>
              <Text style={{...styles.tableCol, width: '25%'}}>{formData.exp2_period}</Text>
              <Text style={{...styles.tableCol, width: '20%'}}>{formData.exp2_company}</Text>
              <Text style={{...styles.tableCol, width: '15%'}}>{formData.exp2_position}</Text>
              <Text style={{...styles.tableCol, width: '40%', borderRight: 0, textAlign: 'left'}}>{formData.exp2_duties}</Text>
          </View>
        </View>

        {/* 자격증 */}
        <Text style={styles.h2}>[자격/면허]</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
              <Text style={{...styles.tableColHeader, width: '35%'}}>자격증명</Text>
              <Text style={{...styles.tableColHeader, width: '25%'}}>등급/점수</Text>
              <Text style={{...styles.tableColHeader, width: '40%', borderRight: 0}}>발급기관</Text>
          </View>
          <View style={{...styles.tableRow}}>
              <Text style={{...styles.tableCol, width: '35%'}}>{formData.cert1_name}</Text>
              <Text style={{...styles.tableCol, width: '25%'}}>{formData.cert1_level}</Text>
              <Text style={{...styles.tableCol, width: '40%', borderRight: 0}}>{formData.cert1_issuer}</Text>
          </View>
          <View style={{...styles.tableRow}}>
              <Text style={{...styles.tableCol, width: '35%'}}>{formData.cert2_name}</Text>
              <Text style={{...styles.tableCol, width: '25%'}}>{formData.cert2_level}</Text>
              <Text style={{...styles.tableCol, width: '40%', borderRight: 0}}>{formData.cert2_issuer}</Text>
          </View>
          <View style={{...styles.tableRow, borderBottom: 0}}>
              <Text style={{...styles.tableCol, width: '35%'}}>{formData.cert3_name}</Text>
              <Text style={{...styles.tableCol, width: '25%'}}>{formData.cert3_level}</Text>
              <Text style={{...styles.tableCol, width: '40%', borderRight: 0}}>{formData.cert3_issuer}</Text>
          </View>
        </View>

      </Page>

      {/* --- 2 페이지: 자기소개서 --- */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>[자기소개서]</Text>

        <Text style={styles.sectionTitle}>■ 성장과정</Text>
        <Text style={styles.bodyText}>{formData.selfGrowth}</Text>

        <Text style={styles.sectionTitle}>■ 성격의 장·단점 및 특기</Text>
        <Text style={styles.bodyText}>{formData.selfStrengths}</Text>

        <Text style={styles.sectionTitle}>■ 지원동기</Text>
        <Text style={styles.bodyText}>{formData.selfMotivation}</Text>

        <Text style={styles.sectionTitle}>■ 입사 후 포부</Text>
        <Text style={styles.bodyText}>{formData.selfAspirations}</Text>
      </Page>
    </Document>
  );
}
