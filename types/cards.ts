import { Freelancer } from "./freelancer";
import { Job } from "./job";

export interface FreelancerCardProps extends Freelancer {
  onViewProfile: (id: string) => void;
  onMessage: (id: string) => void;
}

export interface JobCardProps extends Job {
  onApply: (jobId: string) => void;
}
