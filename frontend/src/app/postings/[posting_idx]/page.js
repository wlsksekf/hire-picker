import JobPostingDetailClient from "@/components/JobPostingDetailClient";

export default async function JobPostingDetailPage({ params }) {
  console.log("JobPostingDetailPage: raw params received:", params);

  const resolvedParams = await params;

  let posting_idx;
  if (
    resolvedParams &&
    typeof resolvedParams === "object" &&
    resolvedParams !== null &&
    resolvedParams.posting_idx !== undefined
  ) {
    posting_idx = resolvedParams.posting_idx;
  } else {
    posting_idx = undefined;
  }

  return <JobPostingDetailClient posting_idx={posting_idx} />;
}
