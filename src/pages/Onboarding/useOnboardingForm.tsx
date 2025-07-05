
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { format } from "date-fns";

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
      const onboardingData = {
        profileData: {
          ...user?.profileData,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          dateOfBirth: form.dateOfBirth ? format(form.dateOfBirth, 'MM-dd') : '',
          city: form.city,
          country: form.country,
          openToNearbyCities: form.openToNearbyCities,
          languages: form.languages,
          languageProficiency: form.languageProficiency,
          hasDriversLicense: form.hasDriversLicense,
          hasCar: form.hasCar,
          isNative: form.isNative,
          workAuthorized: form.workAuthorized,
          specialization: form.specialization,
          skillLevel: form.skillLevel,
          yearsOfExperience: form.yearsOfExperience,
          certifications: form.certifications,
          projectTypes: form.projectTypes,
          openToTraining: form.openToTraining,
          refereeInfo: form.refereeInfo,
          newsletter: form.newsletter,
          specialPreferences: form.specialPreferences,
          cvFileName: form.cv?.name || '',
          isFreelancer: form.isFreelancer,
          followsLinkedIn: form.followsLinkedIn,
          onboardedAt: new Date().toISOString(),
          isOnboarded: true
        }
      };

      await updateProfile(onboardingData);

      toast({ 
        title: "Onboarding Complete! 🎉", 
        description: "Welcome aboard. Your profile has been updated successfully!" 
      });
      
      navigate("/dashboard/engineer");
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to complete onboarding. Please try again." 
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
