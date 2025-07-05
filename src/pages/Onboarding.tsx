
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useOnboardingForm } from "./Onboarding/useOnboardingForm";
import { PersonalInfoSection } from "./Onboarding/PersonalInfoSection";
import { LanguageEligibilitySection } from "./Onboarding/LanguageEligibilitySection";
import { ProfessionalInfoSection } from "./Onboarding/ProfessionalInfoSection";
import { AdditionalInfoSection } from "./Onboarding/AdditionalInfoSection";

const Onboarding = () => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="mb-2 text-primary text-center text-2xl">Engineer Onboarding</CardTitle>
          <p className="text-center text-muted-foreground">Complete your profile to get started</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <PersonalInfoSection
              form={form}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleRadioChange={handleRadioChange}
              handleDateChange={handleDateChange}
            />

            <LanguageEligibilitySection
              form={form}
              handleMultiSelectChange={handleMultiSelectChange}
              handleSelectChange={handleSelectChange}
              handleRadioChange={handleRadioChange}
            />

            <ProfessionalInfoSection
              form={form}
              handleInputChange={handleInputChange}
              handleMultiSelectChange={handleMultiSelectChange}
              handleSelectChange={handleSelectChange}
              handleRadioChange={handleRadioChange}
            />

            <AdditionalInfoSection
              form={form}
              handleInputChange={handleInputChange}
              handleFileChange={handleFileChange}
              handleRadioChange={handleRadioChange}
            />

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
              size="lg"
            >
              {loading ? "Submitting..." : "Complete Onboarding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
