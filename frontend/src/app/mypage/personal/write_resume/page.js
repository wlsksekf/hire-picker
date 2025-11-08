"use client";

import React, { useEffect, useState } from "react";
import ResumeForm from "@/components/ResumeForm";
import { api, getResumeTemplate, createResume, saveResumeCertifications, searchSchools as apiSearchSchools, generateAiFullDraft, generateAiResumeDraft, getCertifications } from "@/api";

export default function WriteResumePage() {
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    gender: "",
    birthdate: "",
    phone: "",
    email: "",
    address: "",
    aiPrompt: "",
    selfGrowth: "",
    selfStrengths: "",
    selfMotivation: "",
    selfAspirations: "",
    // 학력 1
    edu1_period: "",
    edu1_school: "",
    edu1_schoolCode: null,
    edu1_major: "",
    edu1_status: "",
    edu1_score: "",
    // 학력 2
    edu2_period: "",
    edu2_school: "",
    edu2_schoolCode: null,
    edu2_major: "",
    edu2_status: "",
    edu2_score: "",
    // 병역
    military_status: "",
    military_branch: "",
    military_rank: "",
    military_period: "",
    military_reason: "",
    // 자격증 1
    cert1_name: "",
    cert1_level: "",
    cert1_date: "",
    cert1_issuer: "",
    // 자격증 2
    cert2_name: "",
    cert2_level: "",
    cert2_date: "",
    cert2_issuer: "",
    // 자격증 3
    cert3_name: "",
    cert3_level: "",
    cert3_date: "",
    cert3_issuer: "",
    // 경력 1
    exp1_period: "",
    exp1_company: "",
    exp1_position: "",
    exp1_duties: "",
    exp1_type: "",
    // 경력 2
    exp2_period: "",
    exp2_company: "",
    exp2_position: "",
    exp2_duties: "",
    exp2_type: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [availableExperiences, setAvailableExperiences] = useState([]); // 선택 가능한 경력 목록
  const [availableCertifications, setAvailableCertifications] = useState([]); // 선택 가능한 자격증 목록

  // init: load user and template
  useEffect(() => {
    api.get('/api/users/me')
      .then(res => {
        const u = res.data || {};
        setUserId(u.id || null);
        setFormData(prev => ({
          ...prev,
          name: u.name || '',
          gender: u.gender || '',
          phone: u.phoneNumber || '',
          email: u.email || '',
          address: u.address || ''
        }));
      })
      .catch(() => {});
    
    // 저장된 학력/경력/병역 정보 자동 채우기
    loadResumeTemplate();
  }, []);

  // 이력서 템플릿 데이터 로드 및 자동 채우기
  async function loadResumeTemplate() {
    try {
      const template = await getResumeTemplate();
      if (!template) return;

      const updates = {};

      // 학력 자동 채우기 (최대 2개)
      if (template.academics && template.academics.length > 0) {
        const acad1 = template.academics[0];
        if (acad1) {
          updates.edu1_school = acad1.schoolName || '';
          updates.edu1_schoolCode = acad1.schoolCode || null;
          updates.edu1_major = acad1.major || '';
          updates.edu1_score = acad1.majorScore ? String(acad1.majorScore) : '';
          updates.edu1_status = acad1.degree || '';
          if (acad1.graduationDate) {
            const gradDate = new Date(acad1.graduationDate);
            updates.edu1_period = `${gradDate.getFullYear()}.${String(gradDate.getMonth() + 1).padStart(2, '0')}`;
          }
        }
        if (template.academics.length > 1) {
          const acad2 = template.academics[1];
          if (acad2) {
            updates.edu2_school = acad2.schoolName || '';
            updates.edu2_schoolCode = acad2.schoolCode || null;
            updates.edu2_major = acad2.major || '';
            updates.edu2_score = acad2.majorScore ? String(acad2.majorScore) : '';
            updates.edu2_status = acad2.degree || '';
            if (acad2.graduationDate) {
              const gradDate = new Date(acad2.graduationDate);
              updates.edu2_period = `${gradDate.getFullYear()}.${String(gradDate.getMonth() + 1).padStart(2, '0')}`;
            }
          }
        }
      }

      // 병역 자동 채우기
      if (template.military) {
        updates.military_status = template.military.serviceType || '';
        updates.military_branch = template.military.militaryBranch || '';
        updates.military_rank = template.military.militaryRank || '';
        updates.military_period = template.military.periodOfService || '';
        updates.military_reason = template.military.reasonForExemption || '';
      }

      // 경력과 자격증은 선택 가능하도록 목록만 저장 (자동 채우지 않음)
      // 사용자가 선택할 수 있도록 별도 상태로 관리
      setAvailableExperiences(template.experiences || []);
      
      // 자격증 목록 조회
      try {
        const certs = await getCertifications();
        setAvailableCertifications(certs || []);
      } catch (err) {
        console.error('자격증 목록 조회 실패:', err);
        setAvailableCertifications([]);
      }
      
      setFormData(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('템플릿 로드 실패:', err);
    }
  }

  const [schoolOptions1, setSchoolOptions1] = useState([]);
  const [schoolOptions2, setSchoolOptions2] = useState([]);
  const [schoolLoading1, setSchoolLoading1] = useState(false);
  const [schoolLoading2, setSchoolLoading2] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const searchSchools = async (query, target = 1) => {
    if (!query || query.trim().length < 2) {
      if (target === 1) setSchoolOptions1([]); else setSchoolOptions2([]);
      return;
    }
    try {
      if (target === 1) setSchoolLoading1(true); else setSchoolLoading2(true);
      const list = await apiSearchSchools(query.trim());
      if (target === 1) setSchoolOptions1(list || []);
      else setSchoolOptions2(list || []);
    } finally {
      if (target === 1) setSchoolLoading1(false); else setSchoolLoading2(false);
    }
  };

  // AI dialog handlers
  const onOpenAiDialog = () => setAiDialogOpen(true);
  const onDialogClose = () => setAiDialogOpen(false);

  const onSchoolSelect = (prefix, option) => {
    if (!option) return;
    setFormData((prev) => ({
      ...prev,
      [`${prefix}_school`]: option.schoolName,
      [`${prefix}_schoolCode`]: option.schoolCode,
    }));
  };

  // 경력 선택 핸들러
  const onExperienceSelect = (expIndex, experience) => {
    if (!experience) {
      // 선택 해제
      setFormData((prev) => ({
        ...prev,
        [`exp${expIndex}_company`]: '',
        [`exp${expIndex}_position`]: '',
        [`exp${expIndex}_duties`]: '',
        [`exp${expIndex}_period`]: '',
        [`exp${expIndex}_type`]: '',
      }));
      return;
    }

    // 날짜 포맷팅 헬퍼
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    };

    const period = experience.hireDate 
      ? `${formatDate(experience.hireDate)} ~ ${experience.resignDate ? formatDate(experience.resignDate) : '재직중'}`
      : '';

    setFormData((prev) => ({
      ...prev,
      [`exp${expIndex}_company`]: experience.companyName || '',
      [`exp${expIndex}_position`]: experience.position || '',
      [`exp${expIndex}_duties`]: experience.jobDescription || experience.mainDuties || '',
      [`exp${expIndex}_period`]: period,
      [`exp${expIndex}_type`]: experience.department || '',
    }));
  };

  // 자격증 선택 핸들러
  const onCertificationSelect = (certIndex, certification) => {
    if (!certification) {
      // 선택 해제
      setFormData((prev) => ({
        ...prev,
        [`cert${certIndex}_name`]: '',
        [`cert${certIndex}_level`]: '',
        [`cert${certIndex}_date`]: '',
        [`cert${certIndex}_issuer`]: '',
      }));
      return;
    }

    // 날짜 포맷팅 헬퍼
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    setFormData((prev) => ({
      ...prev,
      [`cert${certIndex}_name`]: certification.certName || '',
      [`cert${certIndex}_level`]: '',
      [`cert${certIndex}_date`]: certification.acquisitionDate ? formatDate(certification.acquisitionDate) : '',
      [`cert${certIndex}_issuer`]: '',
    }));
  };

  // AI draft generate
  const onAiGenerate = async (arg) => {
    let prompt = typeof arg === 'string' ? arg.trim() : (formData.aiPrompt || '').trim();
    if (!prompt) {
      prompt = [
        formData.title,
        formData.selfGrowth,
        formData.selfStrengths,
        formData.selfMotivation,
        formData.selfAspirations,
      ].filter(Boolean).join('\n');
    }
    if (!prompt) { alert('AI 요청 문구를 입력해주세요.'); return; }

    setIsLoading(true);
    try {
      const res = await generateAiFullDraft(prompt);
      const { growthProcess, jobCompetencies, prosAndCons, aspirations } = res.data || {};
      setFormData(prev => ({
        ...prev,
        selfGrowth: growthProcess || prev.selfGrowth || '',
        selfStrengths: jobCompetencies || prev.selfStrengths || '',
        selfMotivation: prosAndCons || prev.selfMotivation || '',
        selfAspirations: aspirations || prev.selfAspirations || '',
      }));
    } finally { setIsLoading(false); }
  };

  // refine
  const onRefine = async () => {
    setAiDialogOpen(false);
    const userData = (formData.aiPrompt || formData.title || '').trim();
    if (!userData) { alert('AI 요청 문구를 입력해주세요.'); return; }
    setIsLoading(true);
    try {
      const resumeDraft = {
        growthProcess: formData.selfGrowth || '',
        jobCompetencies: formData.selfStrengths || '',
        prosAndCons: formData.selfMotivation || '',
        aspirations: formData.selfAspirations || '',
      };
      const res = await generateAiResumeDraft({ userData, resumeDraft });
      const { growthProcess, jobCompetencies, prosAndCons, aspirations } = res.data || {};
      setFormData(prev => ({
        ...prev,
        selfGrowth: growthProcess || prev.selfGrowth || '',
        selfStrengths: jobCompetencies || prev.selfStrengths || '',
        selfMotivation: prosAndCons || prev.selfMotivation || '',
        selfAspirations: aspirations || prev.selfAspirations || '',
      }));
    } finally { setIsLoading(false); }
  };

  // start fresh
  const onStartFresh = async () => {
    setAiDialogOpen(false);
    const userData = (formData.aiPrompt || formData.title || '').trim();
    if (!userData) { alert('AI 요청 문구를 입력해주세요.'); return; }
    setFormData(prev => ({ ...prev, selfGrowth: '', selfStrengths: '', selfMotivation: '', selfAspirations: '' }));
    await onAiGenerate(userData);
  };

  // save
  const onSave = async () => {
    if (!userId) { alert('로그인이 필요합니다.'); return; }
    setIsLoading(true);
    try {
      const resumeDto = {
        title: formData.title || (formData.name ? (formData.name + "'s Resume") : 'Resume'),
        selfGrowth: formData.selfGrowth || '',
        selfStrengths: formData.selfStrengths || '',
        selfMotivation: formData.selfMotivation || '',
        selfAspirations: formData.selfAspirations || '',
        imageUrl: null,
        cert: '',
        isDefault: false,
        status: 'PUBLIC',
        expIdx: null,
        p_user_idx: userId,
        gender: formData.gender || undefined,
      };

      const created = await createResume(resumeDto, imageFile);
      const resumeIdx = created?.resumeId;

      const certNames = Array.isArray(formData.certNames)
        ? formData.certNames
        : (formData.cert && typeof formData.cert === 'string' ? formData.cert.split(',').map(s => s.trim()).filter(Boolean) : []);
      if (resumeIdx && certNames.length > 0) {
        await saveResumeCertifications(resumeIdx, { certIdxList: [], certNameList: certNames });
      }

      alert('이력서가 저장되었습니다.');
    } catch (e) {
      alert('이력서 저장에 실패했습니다.');
    } finally { setIsLoading(false); }
  };

  return (
    <ResumeForm
      formData={formData}
      onChange={onChange}
      previewImage={previewImage}
      onImageChange={onImageChange}
      isLoading={isLoading}
      onAiGenerate={onAiGenerate}
      onOpenAiDialog={onOpenAiDialog}
      onDownload={() => {}}
      onSave={onSave}
      onRefine={onRefine}
      onStartFresh={onStartFresh}
      dialogOpen={aiDialogOpen}
      onDialogClose={onDialogClose}
      confirmDialogOpen={false}
      onConfirmDialogClose={() => {}}
      onConfirmStartFresh={() => {}}
      searchSchools={searchSchools}
      onSchoolSelect={onSchoolSelect}
      schoolOptions1={schoolOptions1}
      schoolLoading1={schoolLoading1}
      schoolOptions2={schoolOptions2}
      schoolLoading2={schoolLoading2}
      availableExperiences={availableExperiences}
      availableCertifications={availableCertifications}
      onExperienceSelect={onExperienceSelect}
      onCertificationSelect={onCertificationSelect}
    />
  );
}

