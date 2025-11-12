'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumeForm from '@/components/ResumeForm';
import ResumePdfDocument from '@/components/ResumePdfDocument';
import { createEmptyResumeForm } from '@/constants/resumeFormDefaults';

function pad2(value = '') {
  return value.toString().padStart(2, '0');
}

function normalizeIsoDate(dateStr) {
  if (!dateStr) return '';
  const trimmed = String(dateStr).trim();
  if (!trimmed) return '';
  const sanitized = trimmed.replace(/\./g, '-');
  const match = sanitized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function formatDisplayDate(dateStr) {
  const iso = normalizeIsoDate(dateStr);
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${year}.${month}.${day}`;
}

function formatPeriod(startDate, endDate) {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);
  if (!start && !end) return '';
  const endLabel = end || '재직중';
  if (!start) return endLabel;
  return `${start} ~ ${endLabel}`;
}

function parseCertSummary(summary) {
  if (!summary) return [];
  return summary
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*?)(?:\((.*?)\))?$/);
      if (match) {
        return { name: match[1].trim(), score: match[2] ? match[2].trim() : '' };
      }
      return { name: entry, score: '' };
    });
}

function mapDetailToForm(detail) {
  const next = createEmptyResumeForm();
  next.title = detail.title || '';
  next.selfGrowth = detail.selfGrowth || '';
  next.selfStrengths = detail.selfStrengths || '';
  next.selfMotivation = detail.selfMotivation || '';
  next.selfAspirations = detail.selfAspirations || '';
  next.cert = detail.cert || '';

  const personal = detail.personal || {};
  next.name = personal.name || '';
  next.gender = personal.gender || '';
  next.phone = personal.phone || personal.phoneNumber || '';
  next.email = personal.email || '';
  next.address = personal.address || '';

  const academics = Array.isArray(detail.academics) ? detail.academics : [];
  academics.slice(0, 2).forEach((item, index) => {
    const idx = index + 1;
    next[`edu${idx}_school`] = item.schoolName || '';
    next[`edu${idx}_major`] = item.major || '';
    next[`edu${idx}_status`] = item.degree || '';
    next[`edu${idx}_score`] = item.majorScore != null ? String(item.majorScore) : '';
    next[`edu${idx}_admission`] = normalizeIsoDate(item.admissionDate);
    next[`edu${idx}_graduation`] = normalizeIsoDate(item.graduationDate);
    next[`edu${idx}_period`] = formatPeriod(item.admissionDate, item.graduationDate);
  });

  const experiences = Array.isArray(detail.experiences) ? detail.experiences : [];
  experiences.slice(0, 2).forEach((item, index) => {
    const idx = index + 1;
    next[`exp${idx}_company`] = item.companyName || '';
    next[`exp${idx}_position`] = item.position || '';
    next[`exp${idx}_duties`] = item.mainDuties || item.jobDescription || '';
    next[`exp${idx}_type`] = item.department || '';
    next[`exp${idx}_period`] = formatPeriod(item.hireDate, item.resignDate);
    next[`exp${idx}_hire`] = normalizeIsoDate(item.hireDate);
    next[`exp${idx}_resign`] = normalizeIsoDate(item.resignDate);
  });

  const military = detail.military || null;
  if (military) {
    next.military_status = military.serviceType || '';
    next.military_branch = military.militaryBranch || '';
    next.military_rank = military.militaryRank || '';
    next.military_enlistment = normalizeIsoDate(military.enlistmentDate);
    next.military_discharge = normalizeIsoDate(military.dischargeDate);
    next.military_reason = military.reasonForExemption || '';
    next.military_period = formatPeriod(military.enlistmentDate, military.dischargeDate);
  }

  const certs = parseCertSummary(detail.cert);
  certs.slice(0, 3).forEach((item, index) => {
    const idx = index + 1;
    next[`cert${idx}_name`] = item.name;
    next[`cert${idx}_score`] = item.score;
  });

  return next;
}

export default function ResumeDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [formData, setFormData] = useState(() => createEmptyResumeForm());
  const [previewImage, setPreviewImage] = useState(null);
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/resume/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`상세 조회 실패: ${res.status}`);
        const detail = await res.json();
        if (ignore) return;
        setFormData(mapDetailToForm(detail));
        setPreviewImage(detail.imageUrl || null);
        setStatus(detail.status || '');
        setTitle(detail.title || '');
      } catch (e) {
        if (!ignore) setError(e.message || '상세를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const pdfData = useMemo(() => ({
    ...formData,
    resume_status: status,
    resume_title: title,
  }), [formData, status, title]);

  if (!id) {
  return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography>유효하지 않은 이력서입니다.</Typography>
            </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
            </Box>
  );
}

  if (error) {
  return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
    </Box>
  );
}

  return (
    <Box sx={{ py: 4, maxWidth: 960, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title || '이력서'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button component={NextLink} href={`/mypage/personal/resumes/${id}/edit`} variant="contained">
            편집
          </Button>
          <PDFDownloadLink document={<ResumePdfDocument formData={pdfData} />} fileName={`${formData.name || 'resume'}_${title || id}.pdf`}>
            {({ loading: generating }) => (
              <Button variant="outlined" disabled={generating}>
                {generating ? 'PDF 생성 중...' : 'PDF 다운로드'}
              </Button>
            )}
          </PDFDownloadLink>
        </Box>
      </Box>

      {status && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          공개 상태: {status === 'PUBLIC' ? '공개' : status === 'PRIVATE' ? '비공개' : status}
        </Typography>
            )}

      <ResumeForm
        formData={formData}
        onChange={() => {}}
        previewImage={previewImage}
        onImageChange={() => {}}
        isLoading={false}
        onAiGenerate={() => {}}
        onOpenAiDialog={() => {}}
        onDownload={() => {}}
        onSave={() => {}}
        dialogOpen={false}
        onDialogClose={() => {}}
        onStartFresh={() => {}}
        onRefine={() => {}}
        confirmDialogOpen={false}
        onConfirmDialogClose={() => {}}
        onConfirmStartFresh={() => {}}
        searchSchools={() => {}}
        onSchoolSelect={() => {}}
        schoolOptions1={[]}
        schoolLoading1={false}
        schoolOptions2={[]}
        schoolLoading2={false}
        availableExperiences={[]}
        availableCertifications={[]}
        onExperienceSelect={() => {}}
        onCertificationSelect={() => {}}
        readOnly
      />
    </Box>
  );
}
