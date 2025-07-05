
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { SKILLS, SKILL_LEVELS, CERTIFICATIONS, PROJECT_TYPES } from "./constants";
import { OnboardingFormData } from "./useOnboardingForm";

interface ProfessionalInfoSectionProps {
  form: OnboardingFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleMultiSelectChange: (field: keyof OnboardingFormData, values: string[]) => void;
  handleSelectChange: (field: keyof OnboardingFormData, value: string) => void;
  handleRadioChange: (name: string, value: string) => void;
}

export const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({
  form,
  handleInputChange,
  handleMultiSelectChange,
  handleSelectChange,
  handleRadioChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Professional Information</h3>
      
      <div>
        <Label className="block font-semibold text-primary mb-2">Area of Specialization (Skills) *</Label>
        <MultiSelect
          options={SKILLS}
          selected={form.specialization}
          onChange={(values) => handleMultiSelectChange('specialization', values)}
          placeholder="Select your skills"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block font-semibold text-primary mb-2">Skill Level *</Label>
          <Select value={form.skillLevel} onValueChange={(value) => handleSelectChange('skillLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select skill level" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block font-semibold text-primary mb-2">Years of Experience *</Label>
          <Input
            name="yearsOfExperience"
            type="number"
            value={form.yearsOfExperience}
            onChange={handleInputChange}
            placeholder="5"
            required
          />
        </div>
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-2">Networking Certifications</Label>
        <MultiSelect
          options={CERTIFICATIONS}
          selected={form.certifications}
          onChange={(values) => handleMultiSelectChange('certifications', values)}
          placeholder="Select your certifications"
        />
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-2">What type of project would you like to work with us on? *</Label>
        <MultiSelect
          options={PROJECT_TYPES}
          selected={form.projectTypes}
          onChange={(values) => handleMultiSelectChange('projectTypes', values)}
          placeholder="Select project types"
        />
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-3">Are you open to free IT support trainings from us? *</Label>
        <RadioGroup value={form.openToTraining} onValueChange={(value) => handleRadioChange('openToTraining', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="training-yes" />
            <Label htmlFor="training-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="training-no" />
            <Label htmlFor="training-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-3">Are you a Freelancer? *</Label>
        <RadioGroup value={form.isFreelancer} onValueChange={(value) => handleRadioChange('isFreelancer', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="freelancer-yes" />
            <Label htmlFor="freelancer-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="freelancer-no" />
            <Label htmlFor="freelancer-no">No</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
