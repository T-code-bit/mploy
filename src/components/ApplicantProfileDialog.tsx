import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, FileText, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ApplicantProfile {
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  about: string | null;
  phone: string | null;
  address: string | null;
}

interface Props {
  applicantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplicantProfileDialog = ({ applicantId, open, onOpenChange }: Props) => {
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, about, phone, address")
        .eq("user_id", id)
        .single();
      setProfile(data as ApplicantProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && applicantId) {
      fetchProfile(applicantId);
    } else {
      setProfile(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Applicant Profile</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {(profile.full_name || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-display font-bold text-foreground text-lg">{profile.full_name || "Unknown"}</h3>
                {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
              </div>
            </div>

            <div className="space-y-3">
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.address}</span>
                </div>
              )}
            </div>

            {profile.about && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" /> About
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.about}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Profile not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantProfileDialog;
