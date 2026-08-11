import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User, Mail, Phone, MapPin, FileText, Briefcase, Download,
  Calendar, GraduationCap, DollarSign, Clock, Linkedin, Loader2, MessageSquare, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplicantProfile {
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  about: string | null;
  phone: string | null;
  address: string | null;
}

interface ApplicationData {
  id: string;
  cover_letter: string | null;
  cv_url: string | null;
  resume_url: string | null;
  scanned_id_url: string | null;
  recommendation_letter_url: string | null;
  phone: string | null;
  linkedin_url: string | null;
  availability: string | null;
  years_of_experience: string | null;
  date_of_birth: string | null;
  county: string | null;
  gender: string | null;
  expected_salary: string | null;
  education_level: string | null;
  employer_feedback: string | null;
  employer_contact_info: string | null;
  applicant_email: string | null;
  status: string;
  created_at: string;
}

interface Props {
  applicantId: string | null;
  applicationId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplicantProfileDialog = ({ applicantId, applicationId, open, onOpenChange }: Props) => {
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async (userId: string, appId?: string | null) => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, about, phone, address")
        .eq("user_id", userId)
        .single();
      setProfile(profileData as ApplicantProfile);

      if (appId) {
        const { data: appData } = await supabase
          .from("applications")
          .select("*")
          .eq("id", appId)
          .single();
        if (appData) {
          setApplication(appData as unknown as ApplicationData);
          setFeedback((appData as any).employer_feedback || "");
          setContactInfo((appData as any).employer_contact_info || "");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load whenever the dialog is opened by the parent (props-driven), not just via onOpenChange
  useEffect(() => {
    if (open && applicantId) {
      fetchData(applicantId, applicationId);
    }
    if (!open) {
      setProfile(null);
      setApplication(null);
      setFeedback("");
      setContactInfo("");
    }
  }, [open, applicantId, applicationId]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const saveFeedback = async () => {
    if (!application) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({
          employer_feedback: feedback || null,
          employer_contact_info: contactInfo || null,
        } as any)
        .eq("id", application.id);
      if (error) throw error;
      toast.success("Feedback saved successfully");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openDocument = async (path: string) => {
    // Support both stored paths and legacy full URLs
    if (/^https?:\/\//.test(path)) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    const { data, error } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(path, 60 * 60); // 1 hour
    if (error || !data?.signedUrl) {
      toast.error("Unable to open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const DocumentLink = ({ url, label }: { url: string | null; label: string }) => {
    if (!url) return null;
    return (
      <button
        type="button"
        onClick={() => openDocument(url)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors text-sm text-primary font-medium"
      >
        <Download className="h-4 w-4" /> {label}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] rounded-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl">Applicant Profile & Application</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[75vh] px-6 pb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : profile ? (
            <div className="space-y-6 pt-2">
              {/* Profile Header */}
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

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {application?.applicant_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${application.applicant_email}`} className="text-primary hover:underline break-all">
                      {application.applicant_email}
                    </a>
                  </div>
                )}
                {(application?.phone || profile.phone) && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{application?.phone || profile.phone}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{profile.address}</span>
                  </div>
                )}
                {application?.linkedin_url && (
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{application.linkedin_url}</a>
                  </div>
                )}
                {application?.county && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">County: {application.county}</span>
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

              {application && (
                <>
                  <Separator />
                  {/* Application Details */}
                  <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Application Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {application.education_level && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>Education: {application.education_level}</span>
                      </div>
                    )}
                    {application.years_of_experience && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Experience: {application.years_of_experience}</span>
                      </div>
                    )}
                    {application.availability && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Availability: {application.availability}</span>
                      </div>
                    )}
                    {application.gender && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Gender: {application.gender}</span>
                      </div>
                    )}
                    {application.date_of_birth && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>DOB: {new Date(application.date_of_birth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {application.cover_letter && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Cover Letter</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-xl">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      <DocumentLink url={application.cv_url} label="CV" />
                      <DocumentLink url={application.resume_url} label="Resume" />
                      <DocumentLink url={application.scanned_id_url} label="Scanned ID" />
                      <DocumentLink url={application.recommendation_letter_url} label="Recommendation" />
                    </div>
                  </div>

                  <Separator />

                  {/* Employer Feedback */}
                  <div className="space-y-4">
                    <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" /> Employer Feedback
                    </h4>
                    <div className="space-y-2">
                      <Label>Feedback to Applicant</Label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide feedback for this applicant..."
                        rows={3}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Your Contact Details (shared with applicant)</Label>
                      <Input
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="e.g. hr@company.com, +254 7XX XXX XXX"
                        className="rounded-xl h-11"
                      />
                    </div>
                    <Button onClick={saveFeedback} disabled={saving} className="bg-gradient-primary text-primary-foreground rounded-xl gap-2">
                      <Send className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Feedback"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Profile not found.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantProfileDialog;
