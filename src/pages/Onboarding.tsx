
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Morocco", "Tunisia", "Algeria", "Ethiopia", "Tanzania"];
const SKILLS = ["Network Administration", "Cybersecurity", "Cloud Computing", "System Administration", "Database Management", "Web Development", "Mobile Development", "DevOps", "IT Support", "Project Management", "Data Analysis", "Software Testing", "Hardware Maintenance", "VOIP Systems", "Network Security"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const CERTIFICATIONS = ["CCNA", "CCNP", "CCIE", "CompTIA A+", "CompTIA Network+", "CompTIA Security+", "Microsoft Azure", "AWS", "CISSP", "CEH", "HP-UX", "VMware", "Cisco", "Oracle", "None"];
const PROJECT_TYPES = ["Full-time", "Dispatch", "One-offs", "Short-time", "Short-term contracts"];
const LANGUAGES = ["English", "French", "Arabic", "Spanish", "Portuguese", "Swahili", "Hausa", "Yoruba", "Igbo", "Amharic"];
const PROFICIENCY_LEVELS = ["Basic", "Conversational", "Fluent", "Native"];

const Onboarding = () => {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: null as Date | null,
    city: "",
    country: "",
    openToNearbyCities: "",
    languages: [] as string[],
    languageProficiency: "",
    hasDriversLicense: "",
    hasCar: "",
    isNative: "",
    workAuthorized: "",
    specialization: [] as string[],
    skillLevel: "",
    yearsOfExperience: "",
    certifications: [] as string[],
    projectTypes: [] as string[],
    openToTraining: "",
    refereeInfo: "",
    newsletter: "",
    specialPreferences: "",
    cv: null as File | null,
    isFreelancer: "",
    followsLinkedIn: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthContext();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, cv: file }));
  }

  function handleLanguageChange(languages: string[]) {
    setForm(f => ({ ...f, languages }));
  }

  function handleSpecializationChange(specialization: string[]) {
    setForm(f => ({ ...f, specialization }));
  }

  function handleCertificationsChange(certifications: string[]) {
    setForm(f => ({ ...f, certifications }));
  }

  function handleProjectTypesChange(projectTypes: string[]) {
    setForm(f => ({ ...f, projectTypes }));
  }

  function handleRadioChange(name: string, value: string) {
    setForm(f => ({ ...f, [name]: value }));
  }

  function validateForm() {
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({ title: "Validation Error", description: validationError });
      return;
    }

    setLoading(true);
    
    try {
      // Prepare onboarding data
      const onboardingData = {
        ...form,
        dateOfBirth: form.dateOfBirth ? format(form.dateOfBirth, 'MM-dd') : '',
        cvFileName: form.cv?.name || '',
        onboardedAt: new Date().toISOString(),
        isOnboarded: true
      };

      // Update user profile with onboarding data
      await updateProfile({
        ...user?.profileData,
        ...onboardingData
      });

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
  }

  React.useEffect(() => {
    if (user?.name) {
      setForm(f => ({ ...f, fullName: user.name }));
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="mb-2 text-primary text-center text-2xl">Engineer Onboarding</CardTitle>
          <p className="text-center text-muted-foreground">Complete your profile to get started</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information */}
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.dateOfBirth || undefined}
                      onSelect={(date) => setForm(f => ({ ...f, dateOfBirth: date || null }))}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="pointer-events-auto"
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
                  <Select value={form.country} onValueChange={(value) => setForm(f => ({ ...f, country: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <Label htmlFor="nearby-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="nearby-no" />
                    <Label htmlFor="nearby-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Language and Eligibility */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Language and Eligibility</h3>
              
              <div>
                <Label className="block font-semibold text-primary mb-2">Language(s) Spoken *</Label>
                <MultiSelect
                  options={LANGUAGES}
                  selected={form.languages}
                  onChange={handleLanguageChange}
                  placeholder="Select languages"
                />
              </div>

              <div>
                <Label className="block font-semibold text-primary mb-2">Level of Proficiency *</Label>
                <Select value={form.languageProficiency} onValueChange={(value) => setForm(f => ({ ...f, languageProficiency: value }))}>
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

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Professional Information</h3>
              
              <div>
                <Label className="block font-semibold text-primary mb-2">Area of Specialization (Skills) *</Label>
                <MultiSelect
                  options={SKILLS}
                  selected={form.specialization}
                  onChange={handleSpecializationChange}
                  placeholder="Select your skills"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block font-semibold text-primary mb-2">Skill Level *</Label>
                  <Select value={form.skillLevel} onValueChange={(value) => setForm(f => ({ ...f, skillLevel: value }))}>
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
                  onChange={handleCertificationsChange}
                  placeholder="Select your certifications"
                />
              </div>

              <div>
                <Label className="block font-semibold text-primary mb-2">What type of project would you like to work with us on? *</Label>
                <MultiSelect
                  options={PROJECT_TYPES}
                  selected={form.projectTypes}
                  onChange={handleProjectTypesChange}
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

            {/* Additional Information */}
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
                      <Label htmlFor="newsletter-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="newsletter-no" />
                      <Label htmlFor="newsletter-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="block font-semibold text-primary mb-3">Are you following STECHAD LTD on LinkedIn? *</Label>
                  <RadioGroup value={form.followsLinkedIn} onValueChange={(value) => handleRadioChange('followsLinkedIn', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="linkedin-yes" />
                      <Label htmlFor="linkedin-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="linkedin-no" />
                      <Label htmlFor="linkedin-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

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
