import JobPostingDetailClient from "./JobPostingDetailClient";

export default async function JobPostingDetailPage({ params }) {
  const posting_idx = params.posting_idx;

  return <JobPostingDetailClient posting_idx={posting_idx} />;
}
