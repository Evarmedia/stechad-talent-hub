
import React from "react";
import { useParams } from "react-router-dom";
const Applicants = () => {
  const { jobId } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-4">Applicants for Job {jobId}</h1>
      <p className="text-text-muted">View applicants for this job posting here.</p>
    </div>
  );
};
export default Applicants;
