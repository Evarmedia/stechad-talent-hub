"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Award, Briefcase, Code, FileText, Mail, Star } from "lucide-react";

interface ApplicantProfileProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedApplicant: any | null;
    onViewResume: (url: string) => void;
}

const ApplicantProfile: React.FC<ApplicantProfileProps> = ({
    open,
    onOpenChange,
    selectedApplicant,
    onViewResume,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">{`Applicant's Profile`}</DialogTitle>
                </DialogHeader>
                {selectedApplicant && (
                    <div className="space-y-6 py-4">
                        {/* Header Section */}
                        <div className="border-b pb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedApplicant?.user?.first_name} {selectedApplicant?.user?.last_name}
                            </h2>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <p className="text-sm">{selectedApplicant?.user?.email}</p>
                                {selectedApplicant.is_vetted ? (
                                    <Badge className="bg-green-700 text-white">Vetted</Badge>
                                ) : (
                                    <Badge className="bg-red-700 text-white">Not Vetted</Badge>
                                )}
                            </div>
                        </div>

                        {/* Experience & Skills Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Experience */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">Experience</h3>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {selectedApplicant?.years_of_experience || 'N/A'} years
                                </p>
                                {selectedApplicant?.experience && (
                                    <p className="text-sm text-gray-700 mt-2">{selectedApplicant.experience}</p>
                                )}
                            </div>

                            {/* Skill Level */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Code className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Skill Level</h3>
                                </div>
                                <Badge className="bg-purple-600 text-white capitalize">
                                    {selectedApplicant?.skill_level || 'Not specified'}
                                </Badge>
                            </div>
                        </div>

                        {/* Remark */}
                        {(
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-pink-600" />
                                    <span className="text-red-800">Admin's Remark!!!</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplicant?.remark || `Not Provided yet`}
                                </div>
                            </div>
                        )}

                        {/* Specializations */}
                        {selectedApplicant?.specialization && selectedApplicant.specialization.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-600" />
                                    Specializations
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplicant.specialization.map((spec: string, idx: number) => (
                                        <Badge key={idx} className="bg-amber-100 text-amber-900">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {selectedApplicant?.certifications && selectedApplicant.certifications.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                                <ul className="space-y-2">
                                    {selectedApplicant.certifications.map((cert: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-green-600 mt-1">✓</span>
                                            <span>{cert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Project Types */}
                        {selectedApplicant?.project_types && selectedApplicant.project_types.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Project Types</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplicant.project_types.map((type: string, idx: number) => (
                                        <Badge key={idx} className="bg-green-100 text-green-900">
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Languages */}
                        {selectedApplicant?.languages && selectedApplicant.languages.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {selectedApplicant.languages.map((lang: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            {lang}
                                        </div>
                                    ))}
                                </div>
                                {selectedApplicant?.language_proficiency && (
                                    <p className="text-xs text-gray-600 mt-2">
                                        Proficiency: <span className="capitalize font-semibold">{selectedApplicant.language_proficiency}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Personal Info */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Work Authorized</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedApplicant?.work_authorized ? '✓ Yes' : '✗ No'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Driver's License</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedApplicant?.has_drivers_license ? '✓ Yes' : '✗ No'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Own Vehicle</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedApplicant?.has_car ? '✓ Yes' : '✗ No'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Open to Training</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedApplicant?.open_to_training ? '✓ Yes' : '✗ No'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Freelancer</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedApplicant?.is_freelancer ? '✓ Yes' : '✗ No'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Open to Nearby Cities</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedApplicant?.open_to_nearby_cities ? '✓ Yes' : '✗ No'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CV Download */}
                        {selectedApplicant?.cv_url && (
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Curriculum Vitae</p>
                                        <p className="text-sm text-gray-600">View complete resume</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                        onViewResume(selectedApplicant.cv_url);
                                        onOpenChange(false);
                                    }}
                                >
                                    View CV
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ApplicantProfile;
