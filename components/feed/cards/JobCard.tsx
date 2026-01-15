"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  IndianRupeeIcon, 
  Bookmark,
  BookmarkCheck,
  Send,
  Clock,
  User,
  Briefcase,
  Award,
  GraduationCap,
  Wrench,
  Star,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobStatus, ApplicationStatus, Experience } from "@/app/generated/prisma/enums";

/* ================= TYPES ================= */

export interface JobCardProps {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientCompany?: string;
  requiredExperience: Experience;
  payPerHour?: number;
  mandatorySkills: string[];
  niceToHaveSkills?: string[];
  tools?: string[];
  preferredLocation?: string;
  preferredEducation?: string;
  clientLocation?: string;
  status: JobStatus;
  postedAt: Date;
  isSaved?: boolean;
  applicationStatus?: ApplicationStatus | null;
  onSaveJob?: (id: string) => void;
  onUnsaveJob?: (id: string) => void;
  onApply?: (id: string) => void;
  onWithdraw?: (id: string) => void;
}

/* ================= COMPONENT ================= */

export default function JobCard({
  id,
  title,
  description,
  clientName,
  clientCompany,
  requiredExperience,
  payPerHour,
  mandatorySkills,
  niceToHaveSkills = [],
  tools = [],
  preferredLocation,
  preferredEducation,
  clientLocation,
  status,
  postedAt,
  isSaved = false,
  applicationStatus = null,
  onSaveJob,
  onUnsaveJob,
  onApply,
  onWithdraw,
}: JobCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [showMore, setShowMore] = useState(false);

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if job is open for application
  const isJobOpen = status === 'OPEN';
  
  // Check if user has applied
  const hasApplied = applicationStatus !== null;

  // Get experience color
  const getExperienceColor = (exp: Experience) => {
    switch (exp) {
      case 'BEGINNER': return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'EXPERT': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = () => {
    const newSavedState = !saved;
    setSaved(newSavedState);
    if (newSavedState && onSaveJob) {
      onSaveJob(id);
    } else if (!newSavedState && onUnsaveJob) {
      onUnsaveJob(id);
    }
  };

  const handleApply = () => {
    if (onApply && !hasApplied) {
      onApply(id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-200 transition-colors w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-sm text-gray-900">{clientName}</p>
            {clientCompany && (
              <span className="text-sm text-gray-600">• {clientCompany}</span>
            )}
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="text-gray-400 hover:text-blue-500 transition-colors"
          aria-label={saved ? "Unsave job" : "Save job"}
        >
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-blue-500" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-3 line-clamp-2">
        {description}
      </p>

      {/* Quick Info */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {payPerHour && (
          <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
            <IndianRupeeIcon className="h-4 w-4" />
            <span>₹{payPerHour.toFixed(0)}/hr</span>
          </div>
        )}
        
        <Badge className={getExperienceColor(requiredExperience)}>
          <Award className="h-3 w-3 mr-1" />
          {requiredExperience}
        </Badge>
        
        {clientLocation && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{clientLocation}</span>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          {formatDate(postedAt)}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        {isJobOpen ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Clock className="h-3 w-3 mr-1" />
            Open for Applications
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Briefcase className="h-3 w-3 mr-1" />
            Position Closed
          </Badge>
        )}
      </div>

      {/* Skills Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills</h4>
        <div className="flex flex-wrap gap-1.5">
          {mandatorySkills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
            >
              {skill}
            </span>
          ))}
          {mandatorySkills.length > 4 && !showMore && (
            <button
              onClick={() => setShowMore(true)}
              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
            >
              +{mandatorySkills.length - 4} more
            </button>
          )}
        </div>
        
        {/* Show all skills when expanded */}
        {showMore && mandatorySkills.length > 4 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1.5">
              {mandatorySkills.slice(4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowMore(false)}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
            >
              Show less
            </button>
          </div>
        )}
      </div>

      {/* Additional Details (Shown when expanded) */}
      {(niceToHaveSkills.length > 0 || tools.length > 0 || preferredLocation || preferredEducation) && (
        <div className="mb-4">
          {niceToHaveSkills.length > 0 && (
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Nice to have
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {niceToHaveSkills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {tools.length > 0 && (
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                Tools & Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tools.slice(0, 3).map((tool, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-md"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {(preferredLocation || preferredEducation) && (
            <div className="grid grid-cols-2 gap-2">
              {preferredLocation && (
                <div className="text-sm">
                  <p className="text-gray-600">Preferred Location</p>
                  <p className="font-medium text-gray-900">{preferredLocation}</p>
                </div>
              )}
              
              {preferredEducation && (
                <div className="text-sm">
                  <p className="text-gray-600">Education</p>
                  <p className="font-medium text-gray-900">{preferredEducation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer - Application Status & Actions */}
      <div className="pt-3 border-t border-gray-100">
        {hasApplied ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {applicationStatus === 'PENDING' && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Application Pending</span>
                </div>
              )}
              {applicationStatus === 'HIRED' && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Congratulations! You're Hired</span>
                </div>
              )}
              {applicationStatus === 'REJECTED' && (
                <div className="flex items-center gap-1 text-red-600">
                  <span className="text-sm">Application Rejected</span>
                </div>
              )}
            </div>
            
            {applicationStatus === 'PENDING' && onWithdraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdraw(id)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Withdraw
              </Button>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              {!isJobOpen && (
                <p className="text-sm text-gray-600">This position is no longer accepting applications</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isJobOpen ? (
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  Position Closed
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}