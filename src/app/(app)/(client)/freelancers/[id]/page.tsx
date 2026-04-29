"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  IndianRupeeIcon,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

interface FreelancerProfile {
  id: string;
  userId: string;
  industry: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  ratePerHour: number;
  DOB: string;
  city: string;
  state: string;
  pincode: string;
  contact: string;
  languages: string[];
  resume: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && session?.user?.role === "CLIENT") {
      fetchFreelancer();
    }
  }, [id, session]);

  const fetchFreelancer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/freelancers/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setFreelancer(data.freelancer);
      } else {
        toast.error(data.message || "Freelancer not found");
        router.push("/feed");
      }
    } catch (error) {
      console.error("Error fetching freelancer:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleHire = () => {
    router.push(`/post-job?freelancerId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600">Freelancer not found</p>
      </div>
    );
  }

  const fullName = `${freelancer.user.firstName} ${freelancer.user.lastName}`;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-blue-100">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {freelancer.user.firstName?.[0]}
                  {freelancer.user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{fullName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800">
                    {freelancer.industry.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline">{freelancer.experience}</Badge>
                </div>
              </div>
            </div>
            <Button onClick={handleHire} className="bg-blue-600">
              <Briefcase className="mr-2 h-4 w-4" />
              Hire Freelancer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{freelancer.user.email}</span>
              </div>
              {freelancer.contact && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{freelancer.contact}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {(freelancer.city || freelancer.state) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[freelancer.city, freelancer.state]
                      .filter(Boolean)
                      .join(", ")}
                    {freelancer.pincode && ` - ${freelancer.pincode}`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <IndianRupeeIcon className="h-4 w-4" />
                <span className="font-medium">
                  ₹{freelancer.ratePerHour}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {freelancer.bio && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {freelancer.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {freelancer.skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-gray-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {freelancer.languages.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Education & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freelancer.education && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                <p className="text-gray-700">{freelancer.education}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Experience Level
              </h3>
              <p className="text-gray-700 capitalize">
                {freelancer.experience.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Resume */}
          {freelancer.resume && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Resume</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(freelancer.resume!, "_blank")}
              >
                Download Resume
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
