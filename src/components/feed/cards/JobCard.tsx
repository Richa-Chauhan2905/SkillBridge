"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  IndianRupeeIcon,
  Bookmark,
  BookmarkCheck,
  Send,
  CheckCircle,
  Briefcase,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

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
  applicationStatus?: string | null;
  onSaveJob?: (id: string) => Promise<void> | void;
  onUnsaveJob?: (id: string) => Promise<void> | void;
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
  const [saving, setSaving] = useState(false);

  // Get client display name
  const clientName = client
    ? `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim()
    : "Unknown Client";
  const companyName = client.clientProfile?.companyName;
  const displayName = companyName || clientName;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      setSaving(true);
      const newSavedState = !saved;

      if (newSavedState) {
        if (onSaveJob) await onSaveJob(id);
        setSaved(true);
      } else {
        if (onUnsaveJob) await onUnsaveJob(id);
        setSaved(false);
      }
    } catch (error) {
      console.error("Failed to update saved job:", error);
      setSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply && !applicationStatus) {
      onApply(id);
    }
  };

  const handleCardClick = () => {
    if (onViewJob) onViewJob(id);
  };

  // Render appropriate status badge
  const renderStatusBadge = () => {
    if (!applicationStatus) {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          Available
        </Badge>
      );
    }

    switch (applicationStatus) {
      case "ACCEPTED":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // Render right side CTA based on status
  const renderCTA = () => {
    if (!applicationStatus) {
      return (
        <Button
          size="sm"
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          <Send className="h-4 w-4 mr-1" />
          Apply
        </Button>
      );
    }

    // Show status with appropriate icon
    let icon = null;
    let label = "";
    let bgColor = "";

    switch (applicationStatus) {
      case "ACCEPTED":
        icon = <CheckCircle className="h-4 w-4 text-green-600" />;
        label = "Accepted";
        bgColor = "bg-green-50";
        break;
      case "REJECTED":
        icon = <XCircle className="h-4 w-4 text-red-600" />;
        label = "Rejected";
        bgColor = "bg-red-50";
        break;
      default:
        icon = <Clock className="h-4 w-4 text-yellow-600" />;
        label = "Pending";
        bgColor = "bg-yellow-50";
    }

    return (
      <div
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${bgColor}`}
      >
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    );
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
          disabled={saving}
          className="text-gray-400 hover:text-blue-500 transition-colors shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={saved ? "Unsave job" : "Save job"}
        >
          {saving ? (
            <Bookmark className="h-5 w-5 animate-pulse" />
          ) : saved ? (
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
                key={`${skill}-${index}`}
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
          <div className="flex-1">{renderStatusBadge()}</div>
          <div className="flex items-center gap-2">{renderCTA()}</div>
        </div>
      </div>
    </div>
  );
}
