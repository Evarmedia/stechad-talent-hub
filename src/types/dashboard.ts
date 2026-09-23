export interface DashboardJob {
  id?: string;
  jobs_id: string;
  job_id?: string;
  title: string;
  company?: string;
  location?: string;
  employment_type?: string;
  type?: string;
  status: string;
  applications?: number;
  applications_count?: number;
  posted_at?: string;
  posted?: string;
  salary?: string | number;
  requirements?: string[];
  responsibilities?: string[];
  skills_required?: string[];
  description?: string;
  remote?: boolean;
  benefits?: string[];
  required_skills?: string[];
  experience_level?: string;
  application_deadline?: string;
  duration?: string | number;
  openings?: number;
}

export interface DashboardApplication {
  applications_id?: string;
  job_id?: string;
  jobId?: string;
  status?: string;
  applied_at?: string;
  job_title?: string;
  resume_url?: string;
  applicant?: DashboardApplicant;
  job?: DashboardJob;
}

export interface DashboardApplicant {
  engineer_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  profile_picture?: string;
  specialization?: string[];
  skills?: string[];
  years_of_experience?: number;
  availability?: string;
  resume_url?: string;
  cv_url?: string;
  is_vetted?: boolean;
  status?: string;
  languages?: string[];
  language_proficiency?: string;
  certifications?: string[];
  project_types?: string[];
  skill_level?: string;
  open_to_training?: boolean;
  is_freelancer?: boolean;
  open_to_nearby_cities?: boolean;
  work_authorized?: boolean;
  user?: DashboardUser;
  engineer?: {
    engineer_id?: string;
    specialization?: string[];
    years_of_experience?: number;
  };
}

export interface DashboardUser {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  country?: string;
  city?: string;
  phone_number?: string;
  profile_picture?: string;
  browser_location_city?: string;
  browser_location_state?: string;
  browser_location_country?: string;
}

export interface DashboardEngineer {
  engineer_id?: string;
  user_id?: string;
  is_vetted?: boolean;
  vetting_status?: string;
  status?: string;
  specialization?: string[];
  years_of_experience?: number;
  languages?: string[];
  language_proficiency?: string;
  certifications?: string[];
  project_types?: string[];
  skill_level?: string;
  open_to_training?: boolean;
  is_freelancer?: boolean;
  open_to_nearby_cities?: boolean;
  work_authorized?: boolean;
  remark?: string;
  cv_url?: string;
  availability?: string;
  user: DashboardUser;
}

export interface ReviewEngineer extends Omit<DashboardEngineer, "engineer_id"> {
  engineer_id: string;
}

export interface DashboardProject {
  projects_id?: string;
  id?: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  progress?: number;
  deadline?: string;
  start_date?: string;
  team?: string[];
  engineers?: DashboardEngineer[];
}

export interface DashboardInterview {
  interviews_id: string;
  candidate_name?: string;
  job_title?: string;
  date_time: string;
  duration?: number;
  status?: string;
  zoom_link?: string;
  phone_number?: string;
  notes?: string;
}

export interface AdminStatistics {
  totalEngineers?: number;
  totalProjectManagers?: number;
  totalJobs?: number;
  totalApplications?: number;
}
