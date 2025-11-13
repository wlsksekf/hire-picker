import JobPostingDetailClient from "@/components/JobPostingDetailClient";

export default async function JobPostingDetailPage({ params }) {
  console.log("JobPostingDetailPage: raw params received:", params);
  const posting_idx = params.posting_idx;
  console.log("JobPostingDetailPage rendered for posting_idx:", posting_idx);

  return <JobPostingDetailClient posting_idx={posting_idx} />;
}
