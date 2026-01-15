"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  IndianRupeeIcon,
  Star,
  StarIcon,
  User,
  MessageSquare,
  Award,
  GraduationCap,
  Languages,
  Briefcase,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Industry, Experience } from "@/app/generated/prisma/enums";
import { useState } from "react";

/* ================= TYPES ================= */

export interface FreelancerCardProps {
  id: string;
  name: string;
  industry: Industry;
  skills: string[];
  ratePerHour: number;
  city: string;
  state: string;
  experience: Experience;
  bio: string;
  education: string;
  languages: string[];
  resume?: string | null; // Changed from resumeUrl to resume
  isSaved?: boolean;
  onContact: (id: string) => void;
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
  onHire: (id: string) => void;
}

/* ================= COMPONENT ================= */

export default function FreelancerCard({
  id,
  name,
  industry,
  skills,
  ratePerHour,
  city,
  state,
  experience,
  bio,
  education,
  languages,
  resume, // Changed from resumeUrl
  isSaved = false,
  onContact,
  onSave,
  onUnsave,
  onHire,
}: FreelancerCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Get experience color
  const getExperienceColor = (exp: Experience) => {
    switch (exp) {
      case 'BEGINNER': return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EXPERT': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-200 transition-colors w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600">
                  {industry.replace(/_/g, " ")}
                </p>
                <Badge className={getExperienceColor(experience)}>
                  <Award className="h-3 w-3 mr-1" />
                  {experience}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={() => (isSaved ? onUnsave(id) : onSave(id))}
          className="text-gray-400 hover:text-amber-500 transition-colors shrink-0"
          aria-label={isSaved ? "Remove from saved" : "Save freelancer"}
        >
          {isSaved ? (
            <StarIcon className="h-5 w-5 text-amber-500 fill-amber-500" />
          ) : (
            <Star className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Location & Rate */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{city}, {state}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
          <IndianRupeeIcon className="h-4 w-4" />
          <span>₹{ratePerHour.toFixed(0)}/hr</span>
        </div>
      </div>

      {/* Bio - Expandable */}
      <div className="mb-3">
        <p className={`text-gray-700 text-sm ${expanded ? '' : 'line-clamp-3'}`}>
          {bio}
        </p>
        {bio.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 text-xs mt-1 flex items-center hover:text-blue-800"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Read more
              </>
            )}
          </button>
        )}
      </div>

      {/* Skills */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Top Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 6).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
            >
              {skill}
            </span>
          ))}
          {skills.length > 6 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              +{skills.length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* Education & Languages in Columns */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Education */}
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-900 mb-1">
            <GraduationCap className="h-4 w-4" />
            <span className="font-medium">Education</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{education}</p>
        </div>

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-sm text-gray-900 mb-1">
              <Languages className="h-4 w-4" />
              <span className="font-medium">Languages</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {languages.slice(0, 3).map((language, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md"
                >
                  {language}
                </span>
              ))}
              {languages.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{languages.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resume Section - Only show if resume exists */}
      {resume && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Resume Available</p>
                <p className="text-xs text-gray-600">Click to view or download</p>
              </div>
            </div>
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            >
              View Resume
            </a>
          </div>
        </div>
      )}

      {/* No Resume Notice (Optional) */}
      {!resume && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Resume Not Uploaded</p>
              <p className="text-xs text-gray-600">This freelancer hasn't uploaded a resume yet</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Actions */}
      <div className="pt-3 border-t border-gray-100 mt-auto">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Available for hire
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onContact(id)}
              className="border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            
            <Button
              size="sm"
              onClick={() => onHire(id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Hire
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}