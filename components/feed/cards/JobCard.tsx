"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IndianRupeeIcon,
  Bookmark,
  BookmarkCheck,
  Send,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  JobStatus,
  ApplicationStatus,
} from "@/app/generated/prisma/enums";

/* ================= TYPES ================= */

export interface JobCardProps {
  id: string;
  title: string;
  payPerHour?: number;
  mandatorySkills: string[];
  client: {
    firstName: string;
    lastName: string;
    clientProfile?: {
      companyName?: string;
    };
  };
  isSaved?: boolean;
  applicationStatus?: ApplicationStatus | null;
  onSaveJob?: (id: string) => void;
  onUnsaveJob?: (id: string) => void;
  onApply?: (id: string) => void;
  onViewJob?: (id: string) => void;
}

/* ================= COMPONENT ================= */

export default function JobCard({
  id,
  title,
  client,
  payPerHour,
  mandatorySkills,
  isSaved = false,
  applicationStatus = null,
  onSaveJob,
  onUnsaveJob,
  onApply,
  onViewJob,
}: JobCardProps) {
  const [saved, setSaved] = useState(isSaved);

  // Check if user has applied
  const hasApplied = applicationStatus !== null;

  // Get client display name
  const clientName = `${client.firstName} ${client.lastName}`;
  const companyName = client.clientProfile?.companyName;
  const displayName = companyName || clientName;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSavedState = !saved;
    setSaved(newSavedState);
    if (newSavedState && onSaveJob) {
      onSaveJob(id);
    } else if (!newSavedState && onUnsaveJob) {
      onUnsaveJob(id);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply && !hasApplied) {
      onApply(id);
    }
  };

  const handleCardClick = () => {
    if (onViewJob) {
      onViewJob(id);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer w-full h-full flex flex-col"
      onClick={handleCardClick}
    >
      {/* Header: Job Title & Save Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
            {title}
          </h3>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="text-gray-400 hover:text-blue-500 transition-colors shrink-0 ml-2"
          aria-label={saved ? "Unsave job" : "Save job"}
        >
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-blue-500" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Client / Company Name */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Briefcase className="h-3 w-3 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 truncate">{displayName}</p>
        </div>
      </div>

      {/* Pay Rate */}
      {payPerHour && (
        <div className="mb-3">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
            <IndianRupeeIcon className="h-4 w-4 shrink-0" />
            <span>₹{payPerHour.toFixed(0)}/hr</span>
          </div>
        </div>
      )}

      {/* Primary Tech Stack (max 3) */}
      {mandatorySkills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {mandatorySkills.slice(0, 3).map((skill, index) => (
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

      {/* Status / CTA */}
      <div className="pt-3 border-t border-gray-100 mt-auto">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {hasApplied ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Applied
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                Available
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasApplied ? (
              <Button
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 bg-green-50 cursor-default"
                disabled
              >
                ✓ Applied
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-1" />
                Apply
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}