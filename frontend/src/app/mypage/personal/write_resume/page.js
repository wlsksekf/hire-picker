"use client";

import React, { useEffect, useState } from "react";
import ResumeForm from "@/components/ResumeForm";
import { api, getResumeTemplate, createResume, saveResumeCertifications, searchSchools as apiSearchSchools, generateAiFullDraft, generateAiResumeDraft } from "@/api";

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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

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
    getResumeTemplate().catch(() => {});
  }, []);

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
    />
  );
}

