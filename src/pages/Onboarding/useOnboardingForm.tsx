
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface OnboardingFormData {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  city: string;
  country: string;
  openToNearbyCities: string;
  languages: string[];
  languageProficiency: string;
  hasDriversLicense: string;
  hasCar: string;
  isNative: string;
  workAuthorized: string;
  specialization: string[];
  skillLevel: string;
  yearsOfExperience: string;
  certifications: string[];
  projectTypes: string[];
  openToTraining: string;
  refereeInfo: string;
  newsletter: string;
  specialPreferences: string;
  cv: File | null;
  isFreelancer: string;
  followsLinkedIn: string;
}

export const useOnboardingForm = () => {
  const [form, setForm] = useState<OnboardingFormData>({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: null,
    city: "",
    country: "",
    openToNearbyCities: "",
    languages: [],
    languageProficiency: "",
    hasDriversLicense: "",
    hasCar: "",
    isNative: "",
    workAuthorized: "",
    specialization: [],
    skillLevel: "",
    yearsOfExperience: "",
    certifications: [],
    projectTypes: [],
    openToTraining: "",
    refereeInfo: "",
    newsletter: "",
    specialPreferences: "",
    cv: null,
    isFreelancer: "",
    followsLinkedIn: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, cv: file }));
  };

  const handleMultiSelectChange = (field: keyof OnboardingFormData, values: string[]) => {
    setForm(f => ({ ...f, [field]: values }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (field: keyof OnboardingFormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setForm(f => ({ ...f, dateOfBirth: date }));
  };

  const validateForm = () => {
    const required = [
      'fullName', 'phoneNumber', 'city', 'country', 'openToNearbyCities',
      'languageProficiency', 'hasDriversLicense', 'isNative', 'workAuthorized',
      'skillLevel', 'yearsOfExperience', 'openToTraining', 'newsletter',
      'isFreelancer', 'followsLinkedIn'
    ];

    for (const field of required) {
      if (!form[field as keyof typeof form]) {
        return `${field.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^\w/, c => c.toUpperCase())} is required`;
      }
    }

    if (!form.dateOfBirth) return "Date of birth is required";
    if (form.languages.length === 0) return "At least one language is required";
    if (form.specialization.length === 0) return "Area of specialization is required";
    if (form.projectTypes.length === 0) return "Project type preference is required";
    if (!form.cv) return "CV upload is required";
    if (!form.refereeInfo.includes(',') || !form.refereeInfo.includes('@')) {
      return "Please provide referee in format: name, referee@email.com";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({ title: "Validation Error", description: validationError });
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append('date_of_birth', form.dateOfBirth ? format(form.dateOfBirth, 'yyyy-MM-dd') : '');
      formData.append('open_to_nearby_cities', form.openToNearbyCities === 'yes' ? 'true' : 'false');
      formData.append('languages', JSON.stringify(form.languages));
      formData.append('language_proficiency', form.languageProficiency);
      formData.append('has_drivers_license', form.hasDriversLicense === 'yes' ? 'true' : 'false');
      formData.append('has_car', form.hasCar === 'yes' ? 'true' : 'false');
      formData.append('is_native', form.isNative === 'yes' ? 'true' : 'false');
      formData.append('work_authorized', form.workAuthorized === 'yes' ? 'true' : 'false');
      formData.append('specialization', JSON.stringify(form.specialization));
      formData.append('skill_level', form.skillLevel);
      formData.append('years_of_experience', form.yearsOfExperience);
      formData.append('certifications', JSON.stringify(form.certifications));
      formData.append('project_types', JSON.stringify(form.projectTypes));
      formData.append('open_to_training', form.openToTraining === 'yes' ? 'true' : 'false');
      formData.append('is_freelancer', form.isFreelancer === 'yes' ? 'true' : 'false');
      formData.append('follows_linkedin', form.followsLinkedIn === 'yes' ? 'true' : 'false');
      formData.append('referee_info', form.refereeInfo);
      formData.append('newsletter', form.newsletter === 'yes' ? 'true' : 'false');
      formData.append('special_preferences', form.specialPreferences || '');
      
      // Add personal info that needs to be updated in user table
      formData.append('first_name', form.fullName.split(' ')[0] || '');
      formData.append('last_name', form.fullName.split(' ').slice(1).join(' ') || '');
      formData.append('phone_number', form.phoneNumber);
      formData.append('city', form.city);
      formData.append('country', form.country);
      
      // Add CV file if present
      if (form.cv) {
        formData.append('cv', form.cv);
      }

      const response = await updateProfile(formData);

      if (response.success || response.data) {
        toast({ 
          title: "Onboarding Complete! 🎉", 
          description: "Welcome aboard. Your profile has been updated successfully!" 
        });
        
        navigate("/dashboard/engineer");
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      const errorMessage = error.message || error.error || "Failed to complete onboarding. Please try again.";
      toast({ 
        title: "Error", 
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    handleInputChange,
    handleFileChange,
    handleMultiSelectChange,
    handleRadioChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    user
  };
};
