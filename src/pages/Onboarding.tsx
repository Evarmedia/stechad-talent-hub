
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOnboardingForm } from "./Onboarding/useOnboardingForm";
import { PersonalInfoSection } from "./Onboarding/PersonalInfoSection";
import { LanguageEligibilitySection } from "./Onboarding/LanguageEligibilitySection";
import { ProfessionalInfoSection } from "./Onboarding/ProfessionalInfoSection";
import { AdditionalInfoSection } from "./Onboarding/AdditionalInfoSection";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL_STEPS = 4;

const Onboarding = () => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [stepErrors, setStepErrors] = React.useState<string[]>([]);
  
  const {
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
  } = useOnboardingForm();

  React.useEffect(() => {
    if (user?.name) {
      setForm(f => ({ ...f, fullName: user.name }));
    }
  }, [user, setForm]);

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!form.fullName.trim()) errors.push("Full name is required");
        if (!form.phoneNumber.trim()) errors.push("Phone number is required");
        if (!form.dateOfBirth) errors.push("Date of birth is required");
        if (!form.city.trim()) errors.push("City is required");
        if (!form.country) errors.push("Country is required");
        if (!form.openToNearbyCities) errors.push("Please indicate if you're open to working in nearby cities");
        break;

      case 2:
        if (form.languages.length === 0) errors.push("At least one language is required");
        if (!form.languageProficiency) errors.push("Language proficiency level is required");
        if (!form.hasDriversLicense) errors.push("Please indicate if you have a driver's license");
        if (form.hasDriversLicense === 'yes' && !form.hasCar) {
          errors.push("Please indicate if you have a car");
        }
        if (!form.isNative) errors.push("Please indicate if you're a native of your country");
        if (!form.workAuthorized) errors.push("Please indicate if you're authorized to work");
        break;

      case 3:
        if (form.specialization.length === 0) errors.push("Area of specialization is required");
        if (!form.skillLevel) errors.push("Skill level is required");
        if (!form.yearsOfExperience.trim()) errors.push("Years of experience is required");
        if (form.projectTypes.length === 0) errors.push("At least one project type is required");
        if (!form.openToTraining) errors.push("Please indicate if you're open to training");
        if (!form.isFreelancer) errors.push("Please indicate if you're a freelancer");
        break;

      case 4:
        if (!form.refereeInfo.trim()) {
          errors.push("Referee information is required");
        } else if (!form.refereeInfo.includes(',') || !form.refereeInfo.includes('@')) {
          errors.push("Referee info must be in format: name, referee@email.com");
        }
        if (!form.cv) errors.push("CV upload is required");
        if (!form.newsletter) errors.push("Please indicate newsletter preference");
        if (!form.followsLinkedIn) errors.push("Please indicate LinkedIn follow status");
        break;
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    setStepErrors(errors);
    
    if (errors.length === 0 && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      setStepErrors([]);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setStepErrors([]);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Language & Eligibility";
      case 3:
        return "Professional Information";
      case 4:
        return "Additional Information";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="mb-2 text-primary text-center text-2xl">Engineer Onboarding</CardTitle>
          <p className="text-center text-muted-foreground mb-4">Complete your profile to get started</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{getStepTitle()}</span>
              <span className="text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <PersonalInfoSection
                form={form}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleRadioChange={handleRadioChange}
                handleDateChange={handleDateChange}
              />
            )}

            {currentStep === 2 && (
              <LanguageEligibilitySection
                form={form}
                handleMultiSelectChange={handleMultiSelectChange}
                handleSelectChange={handleSelectChange}
                handleRadioChange={handleRadioChange}
              />
            )}

            {currentStep === 3 && (
              <ProfessionalInfoSection
                form={form}
                handleInputChange={handleInputChange}
                handleMultiSelectChange={handleMultiSelectChange}
                handleSelectChange={handleSelectChange}
                handleRadioChange={handleRadioChange}
              />
            )}

            {currentStep === 4 && (
              <AdditionalInfoSection
                form={form}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handleRadioChange={handleRadioChange}
              />
            )}

            {stepErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                <p className="font-semibold text-destructive mb-2">Please complete the following:</p>
                <ul className="list-disc list-inside space-y-1">
                  {stepErrors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                size="lg"
                className="w-32"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  size="lg"
                  className="w-32"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-48"
                >
                  {loading ? "Submitting..." : "Complete Onboarding"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
