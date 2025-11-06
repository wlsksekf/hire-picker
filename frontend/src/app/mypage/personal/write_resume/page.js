"use client";

import React, { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore"; // 인증 스토어 사용
import { api } from "@/api"; // API 클라이언트
import {
  getUserProfile,
  getAcademics,
  getExperiences,
  getMilitary,
  updateUserProfileDetails,
} from "@/api"; // 프로필/학력/경력/병역 API
import ResumePdfDocument from "@/components/ResumePdfDocument";
import { pdf } from "@react-pdf/renderer"; // PDF 생성
import ResumeForm from "@/components/ResumeForm";

// 성별 텍스트 정규화 유틸
const normalizeGender = (v) => {
  if (!v) return "male";
  const s = String(v).toLowerCase();
  if (["female", "f", "여", "여성", "여자"].some((k) => s.includes(k))) return "female";
  if (["male", "m", "남", "남성", "남자"].some((k) => s.includes(k))) return "male";
  return "male";
};

export default function AiResumePage() {
  const { isAuthenticated, user } = useAuthStore((state) => state);

  // 로컬 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [selectedImage, setSelectedImage] = useState(null); // 업로드 파일
  const [previewImage, setPreviewImage] = useState(null); // 미리보기 URL

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    // 기본 정보
    name: "",
    nationality: "내국인", // UI 고정 표시
    gender: "male",
    birthdate: "",
    phone: "",
    email: "",
    address: "",

    // 학력 (최대 2개)
    edu1_period: "",
    edu1_school: "",
    edu1_major: "",
    edu1_status: "",
    edu1_location: "",
    edu1_score: "",
    edu2_period: "",
    edu2_school: "",
    edu2_major: "",
    edu2_status: "",
    edu2_location: "",
    edu2_score: "",

    // 병역
    military_status: "",
    military_branch: "",
    military_rank: "",
    military_period: "",
    military_reason: "",

    // 자격증 (최대 3개)
    cert1_name: "",
    cert1_level: "",
    cert1_date: "",
    cert1_issuer: "",
    cert2_name: "",
    cert2_level: "",
    cert2_date: "",
    cert2_issuer: "",
    cert3_name: "",
    cert3_level: "",
    cert3_date: "",
    cert3_issuer: "",

    // 경력 (최대 2개)
    exp1_period: "",
    exp1_company: "",
    exp1_position: "",
    exp1_duties: "",
    exp1_type: "",
    exp2_period: "",
    exp2_company: "",
    exp2_position: "",
    exp2_duties: "",
    exp2_type: "",

    // 자기소개
    selfGrowth: "",
    selfStrengths: "",
    selfMotivation: "",
    selfAspirations: "",

    // AI 프롬프트
    aiPrompt: "",
  });

  // 사용자 기본값 반영
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        gender: normalizeGender(user.gender),
        phone: user.phoneNumber || "",
        email: user.email || "",
        address: user.address || "",
      }));
    }
  }, [user]);

  // 학력/경력/병역 불러오기
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, a, e, m] = await Promise.allSettled([
          getUserProfile(),
          getAcademics(),
          getExperiences(),
          getMilitary(),
        ]);

        if (!mounted) return;

        setFormData((prev) => {
          const next = { ...prev };

          // 프로필
          if (p.status === "fulfilled" && p.value) {
            const prof = p.value;
            next.name = prof.name ?? next.name;
            if (prof.gender) next.gender = normalizeGender(prof.gender);
            next.phone = prof.phoneNumber ?? next.phone;
            next.email = prof.email ?? next.email;
            next.address = prof.address ?? next.address;
            next.birthdate = prof.birthDate ?? next.birthdate;
          }

          // 학력 (2개까지만 매핑)
          if (a.status === "fulfilled" && Array.isArray(a.value)) {
            const list = a.value;
            const mapAcademic = (src) => ({
              school: src?.schoolName || "",
              major: src?.major || "",
              status: src?.degree || "",
              score: src?.majorScore != null ? String(src.majorScore) : "",
              period: "",
              location: "",
            });
            const a1 = list[0] ? mapAcademic(list[0]) : null;
            const a2 = list[1] ? mapAcademic(list[1]) : null;
            if (a1) {
              next.edu1_school = a1.school;
              next.edu1_major = a1.major;
              next.edu1_status = a1.status;
              next.edu1_score = a1.score;
              next.edu1_period = a1.period;
              next.edu1_location = a1.location;
            }
            if (a2) {
              next.edu2_school = a2.school;
              next.edu2_major = a2.major;
              next.edu2_status = a2.status;
              next.edu2_score = a2.score;
              next.edu2_period = a2.period;
              next.edu2_location = a2.location;
            }
          }

          // 경력 (2개까지만 매핑)
          if (e.status === "fulfilled" && Array.isArray(e.value)) {
            const list = e.value;
            const fmt = (it) => {
              const s = it?.hireDate || "";
              const t = it?.resignDate || "";
              return s && t ? `${s} ~ ${t}` : s || t || "";
            };
            const e1 = list[0];
            const e2 = list[1];
            if (e1) {
              next.exp1_company = e1.companyName || "";
              next.exp1_position = e1.position || "";
              next.exp1_duties = e1.mainDuties || e1.jobDescription || "";
              next.exp1_period = fmt(e1);
              next.exp1_type = next.exp1_type || "";
            }
            if (e2) {
              next.exp2_company = e2.companyName || "";
              next.exp2_position = e2.position || "";
              next.exp2_duties = e2.mainDuties || e2.jobDescription || "";
              next.exp2_period = fmt(e2);
              next.exp2_type = next.exp2_type || "";
            }
          }

          // 병역
          if (m.status === "fulfilled" && m.value) {
            const ms = m.value;
            next.military_status = ms.serviceType || next.military_status;
            next.military_branch = ms.militaryBranch || "";
            next.military_rank = ms.militaryRank || "";
            next.military_period = ms.periodOfService || "";
            next.military_reason = ms.reasonForExemption || "";
          }

          return next;
        });
      } catch (err) {
        console.error("초기 데이터 로드 실패:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 공통 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedImage(file || null);
  };

  // 이미지 미리보기 생성
  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(selectedImage);
    } else {
      setPreviewImage(null);
    }
  }, [selectedImage]);

  // AI 전달용 문자열 생성
  const serializeUserData = () => {
    let s = "";
    s += `이름: ${formData.name}, 성별: ${formData.gender}, 생년월일: ${formData.birthdate}, 연락처: ${formData.phone}, 이메일: ${formData.email}, 주소: ${formData.address}\n`;
    s += `학력1: ${formData.edu1_period}, ${formData.edu1_school}, ${formData.edu1_major}, ${formData.edu1_status}, ${formData.edu1_score}\n`;
    s += `학력2: ${formData.edu2_period}, ${formData.edu2_school}, ${formData.edu2_major}, ${formData.edu2_status}, ${formData.edu2_score}\n`;
    s += `병역: ${formData.military_status}, ${formData.military_branch}, ${formData.military_rank}, ${formData.military_period}\n`;
    s += `자격증1: ${formData.cert1_name}, ${formData.cert1_level}, ${formData.cert1_date}\n`;
    s += `자격증2: ${formData.cert2_name}, ${formData.cert2_level}, ${formData.cert2_date}\n`;
    s += `자격증3: ${formData.cert3_name}, ${formData.cert3_level}, ${formData.cert3_date}\n`;
    s += `경력1: ${formData.exp1_period}, ${formData.exp1_company}, ${formData.exp1_position}, ${formData.exp1_duties}\n`;
    s += `경력2: ${formData.exp2_period}, ${formData.exp2_company}, ${formData.exp2_position}, ${formData.exp2_duties}\n`;
    return s;
  };

  // AI 호출
  const callAiApi = (mode = "generate") => {
    setIsLoading(true);
    setDialogOpen(false);
    setConfirmDialogOpen(false);

    const userData = serializeUserData();
    const jobPostingData = formData.aiPrompt || "(채용공고 요약)";

    const requestBody = { userData, jobPostingData };
    if (mode === "refine") {
      requestBody.resumeDraft = {
        growthProcess: formData.selfGrowth,
        jobCompetencies: formData.selfMotivation,
        prosAndCons: formData.selfStrengths,
        aspirations: formData.selfAspirations,
      };
    }

    api
      .post("/api/ai/resume-draft", requestBody)
      .then((response) => {
        const { growthProcess, jobCompetencies, prosAndCons, aspirations } =
          response.data;
        setFormData((prev) => ({
          ...prev,
          selfGrowth: growthProcess,
          selfStrengths: prosAndCons,
          selfMotivation: jobCompetencies,
          selfAspirations: aspirations,
        }));
      })
      .catch((error) => {
        console.error("AI 초안/개선 요청 실패:", error);
        alert("AI 요청 처리 중 오류가 발생했습니다.");
      })
      .finally(() => setIsLoading(false));
  };

  // AI 생성 버튼
  const handleAiGenerate = () => {
    if (!isAuthenticated) {
      alert("AI 사용을 위해 로그인이 필요합니다.");
      return;
    }
    const hasExisting =
      formData.selfGrowth ||
      formData.selfStrengths ||
      formData.selfMotivation ||
      formData.selfAspirations;
    if (hasExisting) setDialogOpen(true);
    else callAiApi("generate");
  };

  // 다이얼로그 핸들러
  const handleDialogClose = () => setDialogOpen(false);
  const handleRefine = () => callAiApi("refine");
  const handleStartFresh = () => {
    setDialogOpen(false);
    setConfirmDialogOpen(true);
  };
  const handleConfirmDialogClose = () => setConfirmDialogOpen(false);
  const handleConfirmStartFresh = () => callAiApi("generate");

  // 저장 처리
  const handleSaveResume = () => {
    if (!isAuthenticated) {
      alert("저장을 위해 로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    const submissionData = new FormData();
    const resumeDto = { ...formData, p_user_idx: user?.puserIdx };
    submissionData.append(
      "resumeDto",
      new Blob([JSON.stringify(resumeDto)], { type: "application/json" })
    );
    if (selectedImage) submissionData.append("imageFile", selectedImage);

    (async () => {
      try {
        // 프로필 업데이트 (선택적)
        const g = formData.gender ? String(formData.gender).toLowerCase() : "";
        const mappedGender = g === "female" ? "FEMALE" : g === "male" ? "MALE" : undefined;
        const profilePayload = {
          name: formData.name || undefined,
          gender: mappedGender,
          phoneNumber: formData.phone || undefined,
          address: formData.address || undefined,
          birthdate: formData.birthdate || undefined,
        };
        await updateUserProfileDetails(profilePayload);
      } catch (e) {
        console.warn("프로필 업데이트 실패(무시 가능)", e);
      }

      return api
        .post("/api/resume", submissionData, { headers: {} })
        .then((response) => {
          if (response.status === 201) alert("이력서 저장이 완료되었습니다.");
        })
        .catch((error) => {
          console.error("이력서 저장 실패:", error);
          alert("이력서 저장 중 오류가 발생했습니다.");
        })
        .finally(() => setIsLoading(false));
    })();
  };

  // PDF 다운로드
  const handleDownload = async () => {
    try {
      const blob = await pdf(
        <ResumePdfDocument formData={formData} imageUrl={previewImage} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "이력서.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF 생성 실패:", error);
    }
  };

  // 페이지는 상태/핸들러를 제공하고, UI는 컴포넌트에 위임
  return (
    <ResumeForm
      formData={formData}
      onChange={handleChange}
      previewImage={previewImage}
      onImageChange={handleImageChange}
      isLoading={isLoading}
      onAiGenerate={handleAiGenerate}
      onDownload={handleDownload}
      onSave={handleSaveResume}
      dialogOpen={dialogOpen}
      onDialogClose={handleDialogClose}
      onStartFresh={handleStartFresh}
      onRefine={handleRefine}
      confirmDialogOpen={confirmDialogOpen}
      onConfirmDialogClose={handleConfirmDialogClose}
      onConfirmStartFresh={handleConfirmStartFresh}
    />
  );
}

