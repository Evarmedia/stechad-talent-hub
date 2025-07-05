
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "./constants";
import { OnboardingFormData } from "./useOnboardingForm";

interface PersonalInfoSectionProps {
  form: OnboardingFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof OnboardingFormData, value: string) => void;
  handleRadioChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | null) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  form,
  handleInputChange,
  handleSelectChange,
  handleRadioChange,
  handleDateChange
}) => {
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.dateOfBirth ? format(form.dateOfBirth, "MMMM dd") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white border shadow-lg" align="start">
            <Calendar
              mode="single"
              selected={form.dateOfBirth || undefined}
              onSelect={handleDateChange}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
              className="pointer-events-auto bg-white"
            />
          </PopoverContent>
        </Popover>
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
