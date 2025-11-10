"use client";

import React from "react";
import WriteResumePage from "@/app/mypage/personal/write_resume/page";

export default function ResumeEditPage({ params }) {
  const resolvedParams = React.use(params);
  const resumeId = resolvedParams?.id ? Number(resolvedParams.id) : null;
  return <WriteResumePage resumeId={resumeId} />;
}

