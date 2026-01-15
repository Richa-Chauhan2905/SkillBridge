import { Industry } from "@/app/generated/prisma/enums";

export interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;

  // Remove title or keep as optional if you might add it later
  title?: string; // Keep as optional if needed elsewhere
  
  industry: Industry;
  skills: string[];
  experience: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  education: string;
  bio: string;
  resume: string | null;
  ratePerHour: number;
  city: string;
  state: string;
  contact: string;
  languages: string[];

  resumeUrl?: string;

  DOB: Date;
  pincode: number;

  totalReviews?: number;
  averageRating?: number;
  totalJobsCompleted?: number;
  responseRate?: number;
  responseTime?: string;

  isSaved?: boolean;
  isAvailable?: boolean;

  joinedDate: Date;
  lastActive?: Date;
}