
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { LANGUAGES, PROFICIENCY_LEVELS } from "./constants";
import { OnboardingFormData } from "./useOnboardingForm";

interface LanguageEligibilitySectionProps {
  form: OnboardingFormData;
  handleMultiSelectChange: (field: keyof OnboardingFormData, values: string[]) => void;
  handleSelectChange: (field: keyof OnboardingFormData, value: string) => void;
  handleRadioChange: (name: string, value: string) => void;
}

export const LanguageEligibilitySection: React.FC<LanguageEligibilitySectionProps> = ({
  form,
  handleMultiSelectChange,
  handleSelectChange,
  handleRadioChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Language and Eligibility</h3>
      
      <div>
        <Label className="block font-semibold text-primary mb-2">Language(s) Spoken *</Label>
        <MultiSelect
          options={LANGUAGES}
          selected={form.languages}
          onChange={(values) => handleMultiSelectChange('languages', values)}
          placeholder="Select languages"
        />
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-2">Level of Proficiency *</Label>
        <Select value={form.languageProficiency} onValueChange={(value) => handleSelectChange('languageProficiency', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select proficiency level" />
          </SelectTrigger>
          <SelectContent>
            {PROFICIENCY_LEVELS.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="block font-semibold text-primary mb-3">Do you have a driver's license? *</Label>
          <RadioGroup value={form.hasDriversLicense} onValueChange={(value) => handleRadioChange('hasDriversLicense', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="license-yes" />
              <Label htmlFor="license-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="license-no" />
              <Label htmlFor="license-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {form.hasDriversLicense === 'yes' && (
          <div>
            <Label className="block font-semibold text-primary mb-3">Do you have a car? *</Label>
            <RadioGroup value={form.hasCar} onValueChange={(value) => handleRadioChange('hasCar', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="car-yes" />
                <Label htmlFor="car-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="car-no" />
                <Label htmlFor="car-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block font-semibold text-primary mb-3">Are you a native of the country you reside in? *</Label>
          <RadioGroup value={form.isNative} onValueChange={(value) => handleRadioChange('isNative', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="native-yes" />
              <Label htmlFor="native-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="native-no" />
              <Label htmlFor="native-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="block font-semibold text-primary mb-3">Are you authorized to work in your country of residence? *</Label>
          <RadioGroup value={form.workAuthorized} onValueChange={(value) => handleRadioChange('workAuthorized', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="work-yes" />
              <Label htmlFor="work-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="work-no" />
              <Label htmlFor="work-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
