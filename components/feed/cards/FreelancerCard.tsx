"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  IndianRupeeIcon,
  Star,
  StarIcon,
  User,
  Briefcase,
  Award,
  ExternalLink,
} from "lucide-react";
import { Industry, Experience } from "@/app/generated/prisma/enums";

/* ================= TYPES ================= */

export interface FreelancerCardProps {
  id: string;
  firstName: string;
  lastName: string;
  industry: Industry;
  skills: string[];
  ratePerHour: number;
  city: string;
  experience: Experience;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onUnsave?: (id: string) => void;
  onHire?: (id: string) => void;
  onViewProfile?: (id: string) => void;
}

/* ================= COMPONENT ================= */

export default function FreelancerCard({
  id,
  firstName,
  lastName,
  industry,
  skills,
  ratePerHour,
  city,
  experience,
  isSaved = false,
  onSave,
  onUnsave,
  onHire,
  onViewProfile,
}: FreelancerCardProps) {
  const fullName = `${firstName} ${lastName}`;
  
  // Get experience color
  const getExperienceColor = (exp: Experience) => {
    switch (exp) {
      case 'BEGINNER': return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EXPERT': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get industry display name
  const industryDisplay = industry.replace(/_/g, " ");

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved && onUnsave) {
      onUnsave(id);
    } else if (!isSaved && onSave) {
      onSave(id);
    }
  };

  const handleHire = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onHire) {
      onHire(id);
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer w-full h-full flex flex-col"
      onClick={handleViewProfile}
    >
      {/* Header with Name & Save Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
            {fullName}
          </h3>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="text-gray-400 hover:text-amber-500 transition-colors shrink-0 ml-2"
          aria-label={isSaved ? "Remove from saved" : "Save freelancer"}
        >
          {isSaved ? (
            <StarIcon className="h-5 w-5 text-amber-500 fill-amber-500" />
          ) : (
            <Star className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Primary Role / Industry & Experience */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <User className="h-3 w-3 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 truncate">{industryDisplay}</p>
          <Badge className={`${getExperienceColor(experience)} text-xs`}>
            <Award className="h-3 w-3 mr-1" />
            {experience}
          </Badge>
        </div>
      </div>

      {/* Rate per hour */}
      <div className="mb-3">
        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
          <IndianRupeeIcon className="h-4 w-4 shrink-0" />
          <span>₹{ratePerHour.toFixed(0)}/hr</span>
        </div>
      </div>

      {/* Location (city only) */}
      <div className="mb-3">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{city}</span>
        </div>
      </div>

      {/* Top Skills (max 3) */}
      {skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer: CTA */}
      <div className="pt-3 border-t border-gray-100 mt-auto">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleHire}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4 mr-1" />
              Hire
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}