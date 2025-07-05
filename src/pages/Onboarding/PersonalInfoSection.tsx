
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { COUNTRIES } from "./constants";
import { OnboardingFormData } from "./useOnboardingForm";

interface PersonalInfoSectionProps {
  form: OnboardingFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof OnboardingFormData, value: string) => void;
  handleRadioChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | null) => void;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  form,
  handleInputChange,
  handleSelectChange,
  handleRadioChange,
  handleDateChange
}) => {
  const handleMonthDayChange = (type: 'month' | 'day', value: string) => {
    const currentDate = form.dateOfBirth || new Date();
    const month = type === 'month' ? parseInt(value) : currentDate.getMonth() + 1;
    const day = type === 'day' ? parseInt(value) : currentDate.getDate();
    
    // Create a new date with the selected month and day (using current year as placeholder)
    const newDate = new Date(currentDate.getFullYear(), month - 1, day);
    handleDateChange(newDate);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block font-semibold text-primary mb-2">Full Name *</Label>
          <Input
            name="fullName"
            value={form.fullName}
            onChange={handleInputChange}
            placeholder="Your full name"
            required
          />
        </div>
        
        <div>
          <Label className="block font-semibold text-primary mb-2">Phone Number (WhatsApp) *</Label>
          <Input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleInputChange}
            placeholder="+234 xxx xxx xxxx"
            required
          />
        </div>
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-2">Date of Birth (Day and Month) *</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select 
              value={form.dateOfBirth ? (form.dateOfBirth.getMonth() + 1).toString() : ""} 
              onValueChange={(value) => handleMonthDayChange('month', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select 
              value={form.dateOfBirth ? form.dateOfBirth.getDate().toString() : ""} 
              onValueChange={(value) => handleMonthDayChange('day', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                {DAYS.map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block font-semibold text-primary mb-2">City of Residence *</Label>
          <Input
            name="city"
            value={form.city}
            onChange={handleInputChange}
            placeholder="Lagos"
            required
          />
        </div>
        
        <div>
          <Label className="block font-semibold text-primary mb-2">Country *</Label>
          <Select value={form.country} onValueChange={(value) => handleSelectChange('country', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              {COUNTRIES.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="block font-semibold text-primary mb-3">Are you open to working in other nearby cities? *</Label>
        <RadioGroup value={form.openToNearbyCities} onValueChange={(value) => handleRadioChange('openToNearbyCities', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="nearby-yes" />
            <Label htmlFor="nearby-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="nearby-no" />
            <Label htmlFor="nearby-no" className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
