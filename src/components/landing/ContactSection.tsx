import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import GoogleReCaptcha from "@/components/GoogleReCaptcha";

const contactInfo = [
  { icon: Mail, label: "Email", value: "mploykenya@gmail.com", href: "mailto:mploykenya@gmail.com" },
  { icon: Phone, label: "Phone", value: "+254 793 264 418", href: "tel:+254793264418" },
  { icon: MapPin, label: "Office", value: "Nairobi, Kenya", href: "#" },
];

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!captchaToken) {
      toast.error("Please complete the security check");
      return;
    }
    setSending(true);
    const { data: verification, error: verifyError } = await supabase.functions.invoke("verify-recaptcha", {
      body: { token: captchaToken },
    });
    if (verifyError || !verification?.success) {
      toast.error("Security verification failed. Please try again.");
      setCaptchaToken("");
      setSending(false);
      return;
    }
    const { error } = await supabase.from("contact_messages").insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject || null,
      message: formData.message,
    });
    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setSending(false);
  };

  return (
    <section id="contact" className="py-28 bg-muted/40 bg-mesh relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-5">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Contact Us</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            Get in <span className="text-gradient-primary">Touch</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Have questions, feedback, or partnership enquiries? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {contactInfo.map((info) => (
              <a
                key={info.label}
                href={info.href}
                className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <info.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{info.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{info.value}</p>
                </div>
              </a>
            ))}
            <div className="p-5 bg-card rounded-2xl border border-border shadow-card">
              <p className="text-sm font-semibold text-card-foreground mb-1">Business Hours</p>
              <p className="text-sm text-muted-foreground">Mon – Fri: 8:00 AM – 5:00 PM (EAT)</p>
              <p className="text-sm text-muted-foreground">Weekends: Closed</p>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-card p-8"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">Name *</label>
                <Input placeholder="Your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-xl h-11 border-border" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground mb-1.5 block">Email *</label>
                <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-xl h-11 border-border" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Subject</label>
              <Input placeholder="What's this about?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="rounded-xl h-11 border-border" />
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">Message *</label>
              <Textarea placeholder="Tell us more..." rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="rounded-xl border-border resize-none" />
            </div>
            <GoogleReCaptcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
            <Button type="submit" disabled={sending || !captchaToken} className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-12 font-semibold text-base shadow-glow hover:shadow-glow">
              {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
