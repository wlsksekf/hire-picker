// frontend/src/components/ResumePdfDocument.js (수정됨)
'use client';

import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
import Pretendard from "@/fonts/Pretendard-Regular.ttf";

// PDF에서도 사이트 스타일을 유지하기 위해 프리텐다드 폰트 등록
Font.register({ family: "Pretendard", src: Pretendard });

// 표 레이아웃과 텍스트 정렬을 모든 섹션에서 재사용
const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Pretendard", fontSize: 10, color: "#1f2d3d" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#d4d6da", borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: { width: "15%", borderRight: "1px solid #bfbfbf", backgroundColor: "#f2f2f2", padding: 5, fontFamily: "Pretendard", textAlign: "center" },
  tableCol: { padding: 5, borderRight: "1px solid #bfbfbf", textAlign: "center" },
  tableCell: { margin: "auto", marginTop: 2 },
  infoRow: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  infoBlock: { width: "32%" },
  infoTitle: { fontSize: 12, fontWeight: 600, marginBottom: 4, textAlign: "center" },
  infoContent: { fontSize: 11, textAlign: "center" },
});

const ResumePdfDocument = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 이력서 기본 정보 */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>이력서 제목</Text>
            <Text style={styles.infoContent}>{formData.resume_title || ""}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>상태</Text>
            <Text style={styles.infoContent}>{formData.resume_status || ""}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>학점</Text>
            <Text style={styles.infoContent}>{formData.gpa || ""}</Text>
          </View>
        </View>
      </View>

      {/* 학력 정보: 소재지 컬럼 제거 후 중앙 정렬 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>학력 정보</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableColHeader, width: "25%" }}>기간</Text>
            <Text style={{ ...styles.tableColHeader, width: "20%" }}>학교명</Text>
            <Text style={{ ...styles.tableColHeader, width: "20%" }}>학과</Text>
            <Text style={{ ...styles.tableColHeader, width: "15%" }}>졸업구분</Text>
            <Text style={{ ...styles.tableColHeader, width: "20%", borderRight: 0 }}>학점</Text>
          </View>
          {[1, 2].map((idx) => (
            <View style={{ ...styles.tableRow }} key={idx}>
              <Text style={{ ...styles.tableCol, width: "25%" }}>{formData[`edu${idx}_period`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "20%" }}>{formData[`edu${idx}_school`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "20%" }}>{formData[`edu${idx}_major`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "15%" }}>{formData[`edu${idx}_status`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "20%", borderRight: 0 }}>{formData[`edu${idx}_score`] || ""}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 병역 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>병역 정보</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableColHeader, width: "33%" }}>복무 구분</Text>
            <Text style={{ ...styles.tableColHeader, width: "33%" }}>군별</Text>
            <Text style={{ ...styles.tableColHeader, width: "34%", borderRight: 0 }}>계급</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableCol, width: "33%" }}>{formData.military_type || ""}</Text>
            <Text style={{ ...styles.tableCol, width: "33%" }}>{formData.military_branch || ""}</Text>
            <Text style={{ ...styles.tableCol, width: "34%", borderRight: 0 }}>{formData.military_rank || ""}</Text>
          </View>
        </View>
      </View>

      {/* 경력 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>경력 정보</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableColHeader, width: "20%" }}>회사명</Text>
            <Text style={{ ...styles.tableColHeader, width: "20%" }}>부서</Text>
            <Text style={{ ...styles.tableColHeader, width: "20%" }}>직책</Text>
            <Text style={{ ...styles.tableColHeader, width: "20%" }}>근무 기간</Text>
            <Text style={{ ...styles.tableColHeader, width: "20%", borderRight: 0 }}>주요 업무</Text>
          </View>
          {[1, 2].map((idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={{ ...styles.tableCol, width: "20%" }}>{formData[`exp${idx}_company`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "20%" }}>{formData[`exp${idx}_department`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "20%" }}>{formData[`exp${idx}_position`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "20%" }}>{formData[`exp${idx}_period`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "20%", borderRight: 0, textAlign: "left" }}>
                {formData[`exp${idx}_duties`] || ""}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 자격증 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>자격증 정보</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableColHeader, width: "50%" }}>자격증명</Text>
            <Text style={{ ...styles.tableColHeader, width: "50%", borderRight: 0 }}>자격번호</Text>
          </View>
          {[1, 2, 3].map((idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={{ ...styles.tableCol, width: "50%" }}>{formData[`cert${idx}_name`] || ""}</Text>
              <Text style={{ ...styles.tableCol, width: "50%", borderRight: 0 }}>{formData[`cert${idx}_code`] || ""}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 주소 및 연락처 정보 등 추가 여지가 있는 영역 */}
      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>주소</Text>
            <Text style={{ ...styles.tableCol, width: "85%", borderRight: 0, textAlign: "left" }}>{formData.address || ""}</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default ResumePdfDocument;
