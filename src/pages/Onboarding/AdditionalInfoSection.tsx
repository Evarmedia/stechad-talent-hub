
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OnboardingFormData } from "./useOnboardingForm";

interface AdditionalInfoSectionProps {
  form: OnboardingFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange: (name: string, value: string) => void;
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  form,
  handleInputChange,
  handleFileChange,
  handleRadioChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Additional Information</h3>
      
      <div>
        <Label className="block font-semibold text-primary mb-2">Referee Name and Email *</Label>
        <Input
          name="refereeInfo"
          value={form.refereeInfo}
          onChange={handleInputChange}
          placeholder="John Doe, johndoe@email.com"
          required
        />
        <p className="text-sm text-muted-foreground mt-1">Format: name, referee@email.com</p>
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-2">Special Preferences</Label>
        <Textarea
          name="specialPreferences"
          value={form.specialPreferences}
          onChange={handleInputChange}
          placeholder="Any special preferences or notes..."
          rows={3}
        />
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-2">Upload Your Updated CV (PDF) *</Label>
        <Input type="file" accept=".pdf" onChange={handleFileChange} required />
        {form.cv && (
          <span className="text-xs text-muted-foreground mt-1 block">{form.cv.name}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block font-semibold text-primary mb-3">Would you like to subscribe to our newsletter? *</Label>
          <RadioGroup value={form.newsletter} onValueChange={(value) => handleRadioChange('newsletter', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="newsletter-yes" />
              <Label htmlFor="newsletter-yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="newsletter-no" />
              <Label htmlFor="newsletter-no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="block font-semibold text-primary mb-3">Are you following STECHAD LTD on LinkedIn? *</Label>
          <RadioGroup value={form.followsLinkedIn} onValueChange={(value) => handleRadioChange('followsLinkedIn', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="linkedin-yes" />
              <Label htmlFor="linkedin-yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="linkedin-no" />
              <Label htmlFor="linkedin-no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
