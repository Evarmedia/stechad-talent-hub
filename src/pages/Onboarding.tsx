
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

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
