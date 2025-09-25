import { JobCard } from "./JobCard";
import { Stack } from "@mui/material";

const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp",
    type: "정규직",
    salary: "60M - 80M KRW",
    description:
      "We're looking for a senior frontend developer to join our team and build amazing user experiences with React and modern web technologies.",
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "DesignStudio",
    location: "Busan, Korea",
    type: "Full Time",
    salary: "45M - 60M KRW",
    description:
      "Join our creative team to design intuitive and beautiful user interfaces for web and mobile applications.",
  },
  // ... (v0에서 생성했던 나머지 mockJobs 데이터) ...
];

export function JobListings() {
  return (
    <Stack spacing={2}>
      {mockJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </Stack>
  );
}