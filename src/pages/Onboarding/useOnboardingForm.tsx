
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService.js";

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
  const { user, updateUser } = useAuthContext();

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
      // console.log('🟢 [ONBOARDING] ========== STEP 1: Starting FormData construction ==========');
      const formData = new FormData();
      
      // STEP 1: Date of birth
      if (form.dateOfBirth) {
        const dobString = format(form.dateOfBirth, 'yyyy-MM-dd');
        formData.append('date_of_birth', dobString);
        // console.log('  ✓ date_of_birth:', dobString);
      }
      
      // STEP 2: Location & mobility
      formData.append('open_to_nearby_cities', form.openToNearbyCities === 'yes' ? 'true' : 'false');
      // console.log('  ✓ open_to_nearby_cities:', form.openToNearbyCities === 'yes' ? 'true' : 'false');
      
      // STEP 3: Languages (always send, even if empty)
      formData.append('languages', JSON.stringify(form.languages || []));
      // console.log('  ✓ languages:', form.languages);
      
      // STEP 4: Language proficiency 🔴 CRITICAL: Convert to lowercase for ENUM
      if (form.languageProficiency) {
        const proficiencyLowercase = form.languageProficiency.toLowerCase();
        formData.append('language_proficiency', proficiencyLowercase);
        // console.log('  ✓ language_proficiency: "' + form.languageProficiency + '" → "' + proficiencyLowercase + '" (converted to lowercase)');
      }
      
      // STEP 5: Documentation
      formData.append('has_drivers_license', form.hasDriversLicense === 'yes' ? 'true' : 'false');
      // console.log('  ✓ has_drivers_license:', form.hasDriversLicense === 'yes' ? 'true' : 'false');
      
      formData.append('has_car', form.hasCar === 'yes' ? 'true' : 'false');
      // console.log('  ✓ has_car:', form.hasCar === 'yes' ? 'true' : 'false');
      
      // STEP 6: Residency & work authorization
      formData.append('is_native', form.isNative === 'yes' ? 'true' : 'false');
      // console.log('  ✓ is_native:', form.isNative === 'yes' ? 'true' : 'false');
      
      formData.append('work_authorized', form.workAuthorized === 'yes' ? 'true' : 'false');
      // console.log('  ✓ work_authorized:', form.workAuthorized === 'yes' ? 'true' : 'false');
      
      // STEP 7: Professional specialization (always send, even if empty)
      formData.append('specialization', JSON.stringify(form.specialization || []));
      // console.log('  ✓ specialization:', form.specialization);
      
      // STEP 8: Skill level 🔴 CRITICAL: Convert to lowercase for ENUM
      if (form.skillLevel) {
        const skillLevelLowercase = form.skillLevel.toLowerCase();
        formData.append('skill_level', skillLevelLowercase);
        // console.log('  ✓ skill_level: "' + form.skillLevel + '" → "' + skillLevelLowercase + '" (converted to lowercase)');
      }
      
      // STEP 9: Experience
      if (form.yearsOfExperience) {
        formData.append('years_of_experience', form.yearsOfExperience);
        // console.log('  ✓ years_of_experience:', form.yearsOfExperience);
      }
      
      // STEP 10: Certifications (always send, even if empty)
      formData.append('certifications', JSON.stringify(form.certifications || []));
      // console.log('  ✓ certifications:', form.certifications);
      
      // STEP 11: Project types (always send, even if empty)
      formData.append('project_types', JSON.stringify(form.projectTypes || []));
      // console.log('  ✓ project_types:', form.projectTypes);
      
      // STEP 12: Preferences
      formData.append('open_to_training', form.openToTraining === 'yes' ? 'true' : 'false');
      // console.log('  ✓ open_to_training:', form.openToTraining === 'yes' ? 'true' : 'false');
      
      formData.append('is_freelancer', form.isFreelancer === 'yes' ? 'true' : 'false');
      // console.log('  ✓ is_freelancer:', form.isFreelancer === 'yes' ? 'true' : 'false');
      
      formData.append('follows_linkedin', form.followsLinkedIn === 'yes' ? 'true' : 'false');
      // console.log('  ✓ follows_linkedin:', form.followsLinkedIn === 'yes' ? 'true' : 'false');
      
      // STEP 13: Referee info
      if (form.refereeInfo) {
        formData.append('referee_info', form.refereeInfo);
        // console.log('  ✓ referee_info:', form.refereeInfo);
      }
      
      // STEP 14: Newsletter
      formData.append('newsletter', form.newsletter === 'yes' ? 'true' : 'false');
      // console.log('  ✓ newsletter:', form.newsletter === 'yes' ? 'true' : 'false');
      
      // STEP 15: Special preferences
      if (form.specialPreferences) {
        formData.append('special_preferences', form.specialPreferences);
        // console.log('  ✓ special_preferences:', form.specialPreferences);
      }
      
      // STEP 16: CV file
      if (form.cv) {
        formData.append('cv_file', form.cv);
        // console.log('  ✓ cv_file:', form.cv.name);
      }

      // STEP 17: Personal info fields (will be used to update user profile)
      // console.log('🟢 [ONBOARDING] ========== STEP 2: Adding personal info fields ==========');
      const nameParts = form.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      if (firstName) {
        formData.append('first_name', firstName);
        // console.log('  ✓ first_name:', firstName);
      }
      if (lastName) {
        formData.append('last_name', lastName);
        // console.log('  ✓ last_name:', lastName);
      }
      if (form.phoneNumber) {
        formData.append('phone_number', form.phoneNumber);
        // console.log('  ✓ phone_number:', form.phoneNumber);
      }
      if (form.city) {
        formData.append('city', form.city);
        // console.log('  ✓ city:', form.city);
      }
      if (form.country) {
        formData.append('country', form.country);
        // console.log('  ✓ country:', form.country);
      }

      // STEP 18: Submit to backend
      // console.log('🟢 [ONBOARDING] ========== STEP 3: Sending PUT request to /engineers/onboarding ==========');
      const response = await apiService.putNoId('engineers/onboarding', formData, true);
      // console.log('🟢 [ONBOARDING] ✅ SUCCESS Response received:', response);

      if (response.success && response.data) {
        // Treat onboarding like login
        updateUser(response.data.user);

        // console.log("🟢 [ONBOARDING] ========== STEP 5: Redirecting to /dashboard/engineer ==========");
        navigate("/dashboard/engineer");

        toast({
          title: "Onboarding Complete! 🎉",
          description: "Welcome aboard. Your profile has been updated successfully!",
        });
      }

    } catch (error: any) {
      console.error('🔴 [ONBOARDING] ❌ ERROR during submission:');
      console.error('  Error object:', error);
      // console.error('  Error status:', error?.status);
      // console.error('  Error message:', error?.message);
      // console.error('  Response data:', error?.response?.data);
      
      const errorMessage = error.message || error.error || error.response?.data?.error || "Failed to complete onboarding. Please try again.";
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: 'destructive'
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
